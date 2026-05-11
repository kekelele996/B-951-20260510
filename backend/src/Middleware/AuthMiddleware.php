<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Utils\Response;
use App\Utils\JwtHelper;
use App\Models\User;

class AuthMiddleware
{
  public static function authenticate(): array
  {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

    if (!preg_match('/^Bearer\s+(.+)$/', $header, $matches)) {
      Response::error('Unauthorized', 401);
    }

    $token = $matches[1];
    $payload = JwtHelper::decode($token);

    if (!$payload || !isset($payload['user_id'])) {
      Response::error('Invalid token', 401);
    }

    $user = User::query()
      ->select(['id', 'username', 'email', 'role', 'avatar', 'is_active', 'created_at', 'updated_at'])
      ->where('id', (int) $payload['user_id'])
      ->first();

    if (!$user || !$user->is_active) {
      Response::error('User not found or inactive', 401);
    }

    return $user->toArray();
  }
}
