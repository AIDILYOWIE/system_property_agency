<?php

namespace App\Http\Controllers;

use App\Service\BuyerPipelineService;
use App\Service\PropertyPipelineService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PipelineController extends Controller
{
    protected $buyerPipelineService;
    protected $propertyPipelineService;

    public function __construct(
        BuyerPipelineService $buyerPipelineService,
        PropertyPipelineService $propertyPipelineService
    ) {
        $this->buyerPipelineService = $buyerPipelineService;
        $this->propertyPipelineService = $propertyPipelineService;
    }

    public function index(Request $request)
    {
        $activeTab = $request->query('tab', 'buyer'); // Default to buyer

        return Inertia::render('Pipelines/Index', [
            'activeTab' => $activeTab,
            'buyerLeads' => $activeTab === 'buyer'
                ? fn() => $this->buyerPipelineService->getLeads()
                : Inertia::lazy(fn() => $this->buyerPipelineService->getLeads()),
            'propertyLeads' => $activeTab === 'property'
                ? fn() => $this->propertyPipelineService->getKanbanData()
                : Inertia::lazy(fn() => $this->propertyPipelineService->getKanbanData()),
        ]);
    }
}
