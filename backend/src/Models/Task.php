<?php
declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property int $user_id
 * @property string $title
 * @property string|null $description
 * @property string $status
 * @property string $priority
 * @property int $performance_weight
 * @property string $due_date
 * @property string|null $completed_at
 */
class Task extends Model
{
  use SoftDeletes;

  protected $table = 'tasks';

  protected $fillable = [
    'user_id',
    'title',
    'description',
    'status',
    'priority',
    'performance_weight',
    'due_date',
    'completed_at',
  ];

  protected $casts = [
    'id' => 'integer',
    'user_id' => 'integer',
    'performance_weight' => 'integer',
    'due_date' => 'date:Y-m-d',
    'completed_at' => 'datetime',
  ];

  public function user(): BelongsTo
  {
    return $this->belongsTo(User::class, 'user_id');
  }

  public function score(): HasOne
  {
    return $this->hasOne(TaskScore::class, 'task_id');
  }
}

