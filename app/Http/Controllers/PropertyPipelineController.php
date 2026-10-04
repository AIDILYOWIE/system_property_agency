<?php

namespace App\Http\Controllers;

use App\Service\PropertyPipelineService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PropertyPipelineController extends Controller
{
    protected PropertyPipelineService $pipelineService;

    public function __construct(PropertyPipelineService $pipelineService)
    {
        $this->pipelineService = $pipelineService;
    }

    /**
     * Render the Property Pipeline Kanban board.
     */
    public function index()
    {
        $properties = $this->pipelineService->getKanbanData();

        return Inertia::render('Pipelines/PropertyPipeline/PropertyPipeline', [
            'properties' => $properties,
        ]);
    }

    /**
     * Update the seller_pipeline_status of a property.
     * Handles rejection reason (US 4.4 Rule 4) and auto-publish when listed (US 4.4 Rule 1).
     */
    public function updateStatus(Request $request, string $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:incoming,surveyed,agreed,listed,rejected',
            'status_reason' => 'nullable|string|max:255',
        ]);

        $this->pipelineService->updateStatus(
            $id,
            $validated['status'],
            $validated['status_reason'] ?? null,
        );

        return redirect()->back();
    }

    /**
     * US 4.4 Rule 3: Auto-advance status from "incoming" → "surveyed" when WA is clicked.
     */
    public function advanceToSurveyed(string $id)
    {
        $this->pipelineService->advanceToSurveyed($id);

        return redirect()->back();
    }
}
