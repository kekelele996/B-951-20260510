<?php
declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $username
 * @property string $email
 * @property string $password_hash
 * @property string $role
 * @property string|null $avatar
 * @property bool $is_active
 */
class User extends Model
{
  protected $table = 'users';

  protected $fillable = [
    'username',
    'email',
    'password_hash',
    'role',
    'avatar',
    'is_active',
  ];

  protected $hidden = [
    'password_hash',
  ];

  protected $casts = [
    'id' => 'integer',
    'is_active' => 'boolean',
  ];

  public function tasks(): HasMany
  {
    return $this->hasMany(Task::class, 'user_id');
  }

  public function performance(): HasMany
  {
    return $this->hasMany(Performance::class, 'user_id');
  }
}

