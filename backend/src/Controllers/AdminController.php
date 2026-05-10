<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Utils\Response;
use App\Models\Performance;
use App\Models\Task;
use App\Models\TaskScore;
use App\Models\User;

class AdminController
{
  public function listUsers(array $params = [], ?array $user = null): void
  {
    // Only admin can access
    if ($user['role'] !== 'admin') {
      Response::error('无权访问', 403);
    }

    $role = $_GET['role'] ?? null;
    $year = (int) date('Y');
    $month = (int) date('m');

    $users = User::query()
      ->when($role && in_array($role, ['admin', 'user'], true), function ($q) use ($role) {
        $q->where('role', (string) $role);
      })
      ->get(['id', 'username', 'email', 'role', 'avatar', 'is_active', 'created_at', 'updated_at']);

    $userIds = $users->pluck('id')->map(fn($id) => (int) $id)->all();

    $performanceMap = Performance::query()
      ->whereIn('user_id', $userIds)
      ->where('year', $year)
      ->where('month', $month)
      ->get(['user_id', 'total_score', 'task_count'])
      ->keyBy('user_id');

    $tasks = Task::query()
      ->whereIn('user_id', $userIds)
      ->get(['id', 'user_id', 'status']);

    $taskCountByUser = [];
    $completedCountByUser = [];
    $taskUserByTaskId = [];

    foreach ($tasks as $task) {
      $uid = (int) $task->user_id;
      $taskCountByUser[$uid] = ($taskCountByUser[$uid] ?? 0) + 1;
      if (in_array((string) $task->status, ['completed', 'scored'], true)) {
        $completedCountByUser[$uid] = ($completedCountByUser[$uid] ?? 0) + 1;
      }
      $taskUserByTaskId[(int) $task->id] = $uid;
    }

    $taskIds = array_keys($taskUserByTaskId);
    $scores = empty($taskIds)
      ? collect()
      : TaskScore::query()->whereIn('task_id', $taskIds)->get(['task_id', 'score']);

    $scoreSumByUser = [];
    $scoreCountByUser = [];

    foreach ($scores as $score) {
      $taskId = (int) $score->task_id;
      $uid = $taskUserByTaskId[$taskId] ?? null;
      if (!$uid) {
        continue;
      }
      $scoreSumByUser[$uid] = ($scoreSumByUser[$uid] ?? 0) + (int) $score->score;
      $scoreCountByUser[$uid] = ($scoreCountByUser[$uid] ?? 0) + 1;
    }

    $formattedUsers = $users->map(function (User $u) use (
      $performanceMap,
      $taskCountByUser,
      $completedCountByUser,
      $scoreSumByUser,
      $scoreCountByUser
    ) {
      $uid = (int) $u->id;
      $perf = $performanceMap->get($uid);
      $avg = 0.0;
      if (($scoreCountByUser[$uid] ?? 0) > 0) {
        $avg = ($scoreSumByUser[$uid] ?? 0) / ($scoreCountByUser[$uid] ?? 1);
      }

      return [
        'id' => (int) $u->id,
        'username' => $u->username,
        'email' => $u->email,
        'role' => $u->role,
        'avatar' => $u->avatar,
        'is_active' => (bool) $u->is_active,
        'created_at' => $u->created_at ? $u->created_at->format('Y-m-d H:i:s') : null,
        'updated_at' => $u->updated_at ? $u->updated_at->format('Y-m-d H:i:s') : null,
        'current_month_score' => (float) ($perf?->total_score ?? 0),
        'current_month_tasks' => (int) ($perf?->task_count ?? 0),
        'total_task_count' => (int) ($taskCountByUser[$uid] ?? 0),
        'completed_task_count' => (int) ($completedCountByUser[$uid] ?? 0),
        'average_score' => round($avg, 1),
      ];
    })->all();

    usort($formattedUsers, function ($a, $b) {
      $scoreCmp = ($b['current_month_score'] <=> $a['current_month_score']);
      if ($scoreCmp !== 0) {
        return $scoreCmp;
      }
      return strcmp((string) ($a['created_at'] ?? ''), (string) ($b['created_at'] ?? ''));
    });

    Response::success($formattedUsers);
  }

  public function updateUserStatus(array $params = [], ?array $user = null): void
  {
    // Only admin can access
    if ($user['role'] !== 'admin') {
      Response::error('无权访问', 403);
    }

    $id = (int) ($params['id'] ?? 0);
    $input = json_decode(file_get_contents('php://input'), true);
    $isActive = isset($input['is_active']) ? (bool) $input['is_active'] : null;

    if ($isActive === null) {
      Response::error('请提供有效的状态值');
    }

    // Cannot disable yourself
    if ($id === $user['id']) {
      Response::error('无法修改自己的状态');
    }

    $targetUser = User::query()->where('id', $id)->first(['id', 'username']);
    if (!$targetUser) {
      Response::error('用户不存在', 404);
    }

    $targetUser->is_active = $isActive;
    $targetUser->save();

    Response::success(null, $isActive ? '用户已启用' : '用户已禁用');
  }
}
