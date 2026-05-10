<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Utils\Response;
use App\Models\Performance;
use App\Models\Task;
use App\Models\TaskScore;

class PerformanceController
{
  public function stats(array $params = [], ?array $user = null): void
  {
    $year = (int) date('Y');
    $month = (int) date('m');

    $currentMonth = Performance::query()
      ->where('user_id', (int) $user['id'])
      ->where('year', $year)
      ->where('month', $month)
      ->first();

    $totalTasks = Task::query()
      ->where('user_id', (int) $user['id'])
      ->count();

    $avgScore = TaskScore::query()
      ->whereHas('task', function ($q) use ($user) {
        $q->where('user_id', (int) $user['id']);
      })
      ->avg('score');

    $trend = Performance::query()
      ->where('user_id', (int) $user['id'])
      ->orderByDesc('year')
      ->orderByDesc('month')
      ->limit(6)
      ->get(['year', 'month', 'total_score', 'task_count'])
      ->reverse()
      ->values()
      ->all();

    Response::success([
      'current_month_score' => (float) ($currentMonth?->total_score ?? 0),
      'current_month_tasks' => (int) ($currentMonth?->task_count ?? 0),
      'total_tasks' => (int) $totalTasks,
      'average_score' => (float) ($avgScore ?? 0),
      'monthly_trend' => array_map(function ($item) {
        return [
          'year' => (int) $item['year'],
          'month' => (int) $item['month'],
          'score' => (float) $item['total_score'],
          'task_count' => (int) $item['task_count'],
        ];
      }, $trend),
    ]);
  }

  public function ranking(array $params = [], ?array $user = null): void
  {
    $year = (int) ($_GET['year'] ?? date('Y'));
    $month = (int) ($_GET['month'] ?? date('m'));

    $rankings = Performance::query()
      ->with(['user:id,username,email,role,avatar'])
      ->where('year', $year)
      ->where('month', $month)
      ->orderByDesc('total_score')
      ->orderByDesc('task_count')
      ->limit(20)
      ->get();

    $result = [];
    $rank = 1;

    foreach ($rankings as $item) {
      $result[] = [
        'rank' => $rank++,
        'user' => [
          'id' => (int) ($item->user?->id ?? 0),
          'username' => $item->user?->username,
          'email' => $item->user?->email,
          'role' => $item->user?->role,
          'avatar' => $item->user?->avatar,
        ],
        'score' => (float) $item->total_score,
        'task_count' => (int) $item->task_count,
      ];
    }

    Response::success($result);
  }
}
