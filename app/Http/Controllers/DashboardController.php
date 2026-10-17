<?php

namespace App\Http\Controllers;

use App\Service\DashboardService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService
    ) {}

    /**
     * Display the overview dashboard with actionable metrics.
     * US 2.2 Rule 4 & Section 5: Money on the Table, Lease Expiring, etc.
     */
    public function index(): Response
    {
        $metrics = $this->dashboardService->getDashboardMetrics();

        return Inertia::render('Dashboard', [
            'metrics' => $metrics,
        ]);
    }
}
