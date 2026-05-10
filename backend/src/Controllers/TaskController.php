<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Utils\Response;
use App\Models\Performance;
use App\Models\Task;
use App\Models\TaskScore;
use DateTimeImmutable;

class TaskController
{
  public function list(array $params = [], ?array $user = null): void
  {
    $status = $_GET['status'] ?? null;
    $page = max(1, (int) ($_GET['page'] ?? 1));
    $limit = min(50, max(1, (int) ($_GET['limit'] ?? 20)));
    $offset = ($page - 1) * $limit;

    $query = Task::query()
      ->with([
        'user:id,username',
        'score:id,task_id,score,comment',
      ]);

    // Non-admin users can only see their own tasks
    if (($user['role'] ?? 'user') !== 'admin') {
      $query->where('user_id', (int) $user['id']);
    }

    if ($status) {
      $query->where('status', (string) $status);
    }

    $total = (clone $query)->count();

    $tasks = $query
      ->orderByDesc('created_at')
      ->skip($offset)
      ->take($limit)
      ->get();

    $formattedTasks = $tasks->map(function (Task $task) {
      $result = [
        'id' => (int) $task->id,
        'user_id' => (int) $task->user_id,
        'title' => (string) $task->title,
        'description' => $task->description,
        'status' => (string) $task->status,
        'priority' => (string) $task->priority,
        'performance_weight' => (int) $task->performance_weight,
        'due_date' => $task->due_date ? $task->due_date->format('Y-m-d') : null,
        'completed_at' => $task->completed_at ? $task->completed_at->format('Y-m-d H:i:s') : null,
        'created_at' => $task->created_at ? $task->created_at->format('Y-m-d H:i:s') : null,
        'updated_at' => $task->updated_at ? $task->updated_at->format('Y-m-d H:i:s') : null,
        'user' => [
          'username' => $task->user?->username,
        ],
      ];

      if ($task->score) {
        $result['score'] = [
          'id' => (int) $task->score->id,
          'score' => (int) $task->score->score,
          'comment' => $task->score->comment,
        ];
      }

      return $result;
    })->all();

    Response::paginated($formattedTasks, $total, $page, $limit);
  }

  public function create(array $params = [], ?array $user = null): void
  {
    $input = json_decode(file_get_contents('php://input'), true);

    $title = trim($input['title'] ?? '');
    $description = trim($input['description'] ?? '');
    $priority = $input['priority'] ?? 'medium';
    $performanceWeight = max(1, min(10, (int) ($input['performance_weight'] ?? 5)));
    $dueDate = $input['due_date'] ?? null;

    if (empty($title)) {
      Response::error('请输入任务标题');
    }

    if (empty($dueDate)) {
      Response::error('请选择截止日期');
    }

    if (!in_array($priority, ['low', 'medium', 'high'])) {
      Response::error('无效的优先级');
    }

    $task = Task::create([
      'user_id' => (int) $user['id'],
      'title' => $title,
      'description' => $description,
      'status' => 'pending',
      'priority' => $priority,
      'performance_weight' => $performanceWeight,
      'due_date' => $dueDate,
    ]);

    Response::success($task->toArray(), '任务创建成功');
  }

  public function get(array $params = [], ?array $user = null): void
  {
    $id = (int) ($params['id'] ?? 0);

    $task = Task::query()->with(['user:id,username'])->where('id', $id)->first();

    if (!$task) {
      Response::error('任务不存在', 404);
    }

    // Non-admin users can only see their own tasks
    if (($user['role'] ?? 'user') !== 'admin' && (int) $task->user_id !== (int) $user['id']) {
      Response::error('无权访问此任务', 403);
    }

    Response::success($task->toArray());
  }

  public function update(array $params = [], ?array $user = null): void
  {
    $id = (int) ($params['id'] ?? 0);
    $input = json_decode(file_get_contents('php://input'), true);

    $task = Task::query()->where('id', $id)->first();

    if (!$task) {
      Response::error('任务不存在', 404);
    }

    if (($user['role'] ?? 'user') !== 'admin' && (int) $task->user_id !== (int) $user['id']) {
      Response::error('无权修改此任务', 403);
    }

    $title = trim((string) ($input['title'] ?? $task->title));
    $description = trim((string) ($input['description'] ?? ($task->description ?? '')));
    $priority = (string) ($input['priority'] ?? $task->priority);
    $performanceWeight = max(1, min(10, (int) ($input['performance_weight'] ?? $task->performance_weight)));
    $dueDate = (string) ($input['due_date'] ?? ($task->due_date ? $task->due_date->format('Y-m-d') : ''));

    $task->fill([
      'title' => $title,
      'description' => $description,
      'priority' => $priority,
      'performance_weight' => $performanceWeight,
      'due_date' => $dueDate,
    ]);
    $task->save();

    Response::success($task->toArray(), '任务更新成功');
  }

  public function delete(array $params = [], ?array $user = null): void
  {
    $id = (int) ($params['id'] ?? 0);

    $task = Task::query()->where('id', $id)->first();

    if (!$task) {
      Response::error('任务不存在', 404);
    }

    if (($user['role'] ?? 'user') !== 'admin' && (int) $task->user_id !== (int) $user['id']) {
      Response::error('无权删除此任务', 403);
    }

    $task->delete();

    Response::success(null, '任务删除成功');
  }

  public function updateStatus(array $params = [], ?array $user = null): void
  {
    $id = (int) ($params['id'] ?? 0);
    $input = json_decode(file_get_contents('php://input'), true);

    $status = $input['status'] ?? '';

    if (!in_array($status, ['pending', 'in_progress', 'completed', 'scored'])) {
      Response::error('无效的状态');
    }

    $task = Task::query()->where('id', $id)->first();

    if (!$task) {
      Response::error('任务不存在', 404);
    }

    if (($user['role'] ?? 'user') !== 'admin' && (int) $task->user_id !== (int) $user['id']) {
      Response::error('无权修改此任务', 403);
    }

    $task->status = $status;
    $task->completed_at = $status === 'completed' ? date('Y-m-d H:i:s') : null;
    $task->save();

    Response::success($task->toArray(), '状态更新成功');
  }

  public function score(array $params = [], ?array $user = null): void
  {
    // Only admin can score
    if ($user['role'] !== 'admin') {
      Response::error('只有管理员可以评分', 403);
    }

    $id = (int) ($params['id'] ?? 0);
    $input = json_decode(file_get_contents('php://input'), true);

    $score = max(1, min(5, (int) ($input['score'] ?? 3)));
    $comment = trim($input['comment'] ?? '');

    $task = Task::query()->where('id', $id)->first();

    if (!$task) {
      Response::error('任务不存在', 404);
    }

    if ((string) $task->status !== 'completed') {
      Response::error('只能评分已完成的任务');
    }

    $existing = TaskScore::query()->where('task_id', $task->id)->first();
    if ($existing) {
      $existing->fill([
        'score' => $score,
        'comment' => $comment,
        'scorer_id' => (int) $user['id'],
      ]);
      $existing->save();
    } else {
      TaskScore::create([
        'task_id' => $task->id,
        'scorer_id' => (int) $user['id'],
        'score' => $score,
        'comment' => $comment,
      ]);
    }

    $task->status = 'scored';
    $task->save();

    // Update performance
    $this->updatePerformance((int) $task->user_id);

    Response::success(null, '评分成功');
  }

  private function updatePerformance(int $userId): void
  {
    $year = (int) date('Y');
    $month = (int) date('m');

    $start = new DateTimeImmutable(sprintf('%04d-%02d-01 00:00:00', $year, $month));
    $end = $start->modify('first day of next month');

    $scores = TaskScore::query()
      ->with(['task:id,user_id,performance_weight,status'])
      ->whereBetween('created_at', [$start->format('Y-m-d H:i:s'), $end->format('Y-m-d H:i:s')])
      ->whereHas('task', function ($q) use ($userId) {
        $q->where('user_id', $userId)->where('status', 'scored');
      })
      ->get(['id', 'task_id', 'score']);

    $weightedScore = 0.0;
    $totalWeight = 0;
    $taskCount = 0;

    foreach ($scores as $score) {
      $task = $score->task;
      if (!$task) {
        continue;
      }
      $weight = (int) $task->performance_weight;
      $weightedScore += ((int) $score->score) * $weight;
      $totalWeight += $weight;
      $taskCount++;
    }

    $totalScore = $totalWeight > 0 ? $weightedScore / $totalWeight : 0.0;

    Performance::updateOrCreate(
      ['user_id' => $userId, 'year' => $year, 'month' => $month],
      [
        'total_score' => round($totalScore, 2),
        'task_count' => $taskCount,
        'calculated_at' => date('Y-m-d H:i:s'),
      ]
    );
  }
}
