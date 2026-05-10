<?php
declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $task_id
 * @property int $scorer_id
 * @property int $score
 * @property string|null $comment
 * @property string $created_at
 */
class TaskScore extends Model
{
  protected $table = 'task_scores';

  public const UPDATED_AT = null;

  protected $fillable = [
    'task_id',
    'scorer_id',
    'score',
    'comment',
  ];

  protected $casts = [
    'id' => 'integer',
    'task_id' => 'integer',
    'scorer_id' => 'integer',
    'score' => 'integer',
  ];

  public function task(): BelongsTo
  {
    return $this->belongsTo(Task::class, 'task_id');
  }

  public function scorer(): BelongsTo
  {
    return $this->belongsTo(User::class, 'scorer_id');
  }
}

