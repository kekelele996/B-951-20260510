<?php
declare(strict_types=1);

namespace App\Models\Eloquent;

use Illuminate\Container\Container;
use Illuminate\Database\Capsule\Manager as Capsule;
use Illuminate\Events\Dispatcher;

final class Eloquent
{
  private static bool $booted = false;

  public static function boot(): void
  {
    if (self::$booted) {
      return;
    }

    $host = getenv('DB_HOST') ?: 'db';
    $port = (int) (getenv('DB_PORT') ?: '3306');
    $name = getenv('DB_NAME') ?: 'taskdb';
    $user = getenv('DB_USER') ?: 'taskuser';
    $pass = getenv('DB_PASS') ?: 'taskpass';

    $capsule = new Capsule();
    $capsule->addConnection([
      'driver' => 'mysql',
      'host' => $host,
      'port' => $port,
      'database' => $name,
      'username' => $user,
      'password' => $pass,
      'charset' => 'utf8mb4',
      'collation' => 'utf8mb4_unicode_ci',
      'prefix' => '',
      'strict' => true,
    ]);

    $capsule->setEventDispatcher(new Dispatcher(new Container()));
    $capsule->setAsGlobal();
    $capsule->bootEloquent();

    self::$booted = true;
  }
}

