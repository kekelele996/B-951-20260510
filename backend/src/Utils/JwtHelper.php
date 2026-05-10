<?php
declare(strict_types=1);

namespace App\Utils;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtHelper
{
  private static string $secret = 'your-secret-key-change-in-production';
  private static string $algorithm = 'HS256';

  public static function encode(array $payload): string
  {
    $payload['iat'] = time();
    $payload['exp'] = time() + (24 * 60 * 60); // 24 hours

    return JWT::encode($payload, self::$secret, self::$algorithm);
  }

  public static function decode(string $token): ?array
  {
    try {
      $decoded = JWT::decode($token, new Key(self::$secret, self::$algorithm));
      return (array) $decoded;
    } catch (\Exception $e) {
      return null;
    }
  }
}
