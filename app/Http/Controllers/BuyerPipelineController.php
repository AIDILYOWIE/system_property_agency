<?php

namespace App\Http\Controllers;

use App\Http\Requests\BuyerPipeline\BuyerPipelineRequest;
use App\Service\BuyerPipelineService;
use Inertia\Inertia;

class BuyerPipelineController extends Controller
{
    protected $pipelineService;

    public function __construct(BuyerPipelineService $pipelineService)
    {
        $this->pipelineService = $pipelineService;
    }

    public function index()
    {
        $leads = $this->pipelineService->getLeads();

        return Inertia::render('BuyerPipeline/BuyerPipeline', [
            'leads' => $leads
        ]);
    }

    public function updateStatus(BuyerPipelineRequest $request, $id)
    {
        $this->pipelineService->updateLeadStatus(
            $id,
            $request->input('status'),
            $request->input('status_reason')
        );

        return redirect()->back();
    }
}
