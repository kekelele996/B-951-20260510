<?php
declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use App\Utils\Response;
use App\Models\Eloquent\Eloquent;
use App\Controllers\AuthController;
use App\Controllers\TaskController;
use App\Controllers\PerformanceController;
use App\Controllers\AdminController;
use App\Middleware\AuthMiddleware;

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Parse request
$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = preg_replace('#^/api#', '', $uri);

// Initialize database
try {
    Eloquent::boot();
} catch (Exception $e) {
    Response::error('Database connection failed: ' . $e->getMessage(), 500);
}

// Route matching
$routes = [
    // Health check
    'GET /health' => fn() => Response::success(['status' => 'ok']),

    // Auth routes
    'POST /auth/register' => [AuthController::class, 'register'],
    'POST /auth/login' => [AuthController::class, 'login'],
    'POST /auth/logout' => [AuthController::class, 'logout'],
    'GET /auth/me' => [AuthController::class, 'me', true],

    // Task routes
    'GET /tasks' => [TaskController::class, 'list', true],
    'POST /tasks' => [TaskController::class, 'create', true],
    'GET /tasks/{id}' => [TaskController::class, 'get', true],
    'PUT /tasks/{id}' => [TaskController::class, 'update', true],
    'DELETE /tasks/{id}' => [TaskController::class, 'delete', true],
    'PUT /tasks/{id}/status' => [TaskController::class, 'updateStatus', true],
    'POST /tasks/{id}/score' => [TaskController::class, 'score', true],

    // Performance routes
    'GET /performance' => [PerformanceController::class, 'stats', true],
    'GET /performance/rank' => [PerformanceController::class, 'ranking', true],

    // Admin routes
    'GET /admin/users' => [AdminController::class, 'listUsers', true],
    'PUT /admin/users/{id}/status' => [AdminController::class, 'updateUserStatus', true],
];

// Find matching route
$matchedRoute = null;
$params = [];

foreach ($routes as $pattern => $handler) {
    [$routeMethod, $routePath] = explode(' ', $pattern, 2);

    if ($method !== $routeMethod) {
        continue;
    }

    // Convert {id} to regex
    $regex = preg_replace('#\{(\w+)\}#', '(?P<$1>[^/]+)', $routePath);
    $regex = '#^' . $regex . '$#';

    if (preg_match($regex, $uri, $matches)) {
        $matchedRoute = $handler;
        $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
        break;
    }
}

if (!$matchedRoute) {
    Response::error('Route not found', 404);
}

// Handle route
try {
    // Check if route requires auth
    $requiresAuth = false;
    if (is_array($matchedRoute) && isset($matchedRoute[2])) {
        $requiresAuth = $matchedRoute[2];
    }

    // Auth middleware
    $user = null;
    if ($requiresAuth) {
        $user = AuthMiddleware::authenticate();
    }

    // Execute handler
    if (is_callable($matchedRoute)) {
        $matchedRoute();
    } else {
        [$class, $methodName] = $matchedRoute;
        $controller = new $class();
        $controller->$methodName($params, $user);
    }
} catch (Exception $e) {
    Response::error($e->getMessage(), 400);
}
