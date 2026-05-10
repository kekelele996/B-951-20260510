<?php
declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property int $year
 * @property int $month
 * @property float $total_score
 * @property int $task_count
 * @property string $calculated_at
 */
class Performance extends Model
{
  protected $table = 'performance';

  public $timestamps = false;

  protected $fillable = [
    'user_id',
    'year',
    'month',
    'total_score',
    'task_count',
    'calculated_at',
  ];

  protected $casts = [
    'id' => 'integer',
    'user_id' => 'integer',
    'year' => 'integer',
    'month' => 'integer',
    'total_score' => 'float',
    'task_count' => 'integer',
  ];

  public function user(): BelongsTo
  {
    return $this->belongsTo(User::class, 'user_id');
  }
}

