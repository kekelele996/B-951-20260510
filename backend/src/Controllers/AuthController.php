<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Utils\Response;
use App\Utils\JwtHelper;
use App\Models\User;

class AuthController
{
  public function register(array $params = [], ?array $user = null): void
  {
    $input = json_decode(file_get_contents('php://input'), true);

    $username = trim($input['username'] ?? '');
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';

    if (empty($username) || empty($email) || empty($password)) {
      Response::error('请填写所有必填字段');
    }

    if (strlen($password) < 6) {
      Response::error('密码长度至少为6位');
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
      Response::error('邮箱格式不正确');
    }

    $exists = User::query()
      ->where('username', $username)
      ->orWhere('email', $email)
      ->exists();

    if ($exists) {
      Response::error('用户名或邮箱已存在');
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    $created = User::create([
      'username' => $username,
      'email' => $email,
      'password_hash' => $passwordHash,
      'role' => 'user',
      'is_active' => true,
    ]);

    $newUser = User::query()
      ->select(['id', 'username', 'email', 'role', 'avatar', 'is_active', 'created_at', 'updated_at'])
      ->where('id', $created->id)
      ->first();

    $token = JwtHelper::encode(['user_id' => $created->id]);

    Response::json([
      'success' => true,
      'user' => $newUser ? $newUser->toArray() : null,
      'token' => $token,
      'message' => '注册成功',
    ]);
  }

  public function login(array $params = [], ?array $user = null): void
  {
    $input = json_decode(file_get_contents('php://input'), true);

    $username = trim($input['username'] ?? '');
    $password = $input['password'] ?? '';

    if (empty($username) || empty($password)) {
      Response::error('请填写用户名和密码');
    }

    $found = User::query()
      ->where('username', $username)
      ->where('is_active', true)
      ->first();

    if (!$found || !password_verify($password, (string) $found->getAttribute('password_hash'))) {
      Response::error('用户名或密码错误');
    }

    $token = JwtHelper::encode(['user_id' => $found->id]);

    Response::json([
      'success' => true,
      'user' => $found->makeHidden(['password_hash'])->toArray(),
      'token' => $token,
      'message' => '登录成功',
    ]);
  }

  public function logout(array $params = [], ?array $user = null): void
  {
    Response::success(null, '登出成功');
  }

  public function me(array $params = [], ?array $user = null): void
  {
    Response::success($user);
  }
}
