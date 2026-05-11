<?php
declare(strict_types=1);

namespace App\Utils;

class Response
{
  public static function json(array $data, int $code = 200): void
  {
    http_response_code($code);
    echo json_encode($data);
    exit;
  }

  public static function success($data = null, string $message = 'Success'): void
  {
    self::json([
      'success' => true,
      'data' => $data,
      'message' => $message,
    ]);
  }

  public static function error(string $message, int $code = 400): void
  {
    self::json([
      'success' => false,
      'message' => $message,
      'error' => $message,
    ], $code);
  }

  public static function paginated(array $data, int $total, int $page, int $limit): void
  {
    self::json([
      'success' => true,
      'data' => $data,
      'total' => $total,
      'page' => $page,
      'limit' => $limit,
    ]);
  }
}
