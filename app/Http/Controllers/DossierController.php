<?php

namespace App\Http\Controllers;

use App\Service\DossierService;
use Inertia\Inertia;

class DossierController extends Controller
{
    public function __construct(protected DossierService $dossierService) {}

    /**
     * Show private dossier for a property.
     * US 3.2 Private Dossier Generator
     */
    public function show(string $token)
    {
        $safePropertyData = $this->dossierService->getDossierDataByToken($token);
        $agentData = $this->dossierService->getAgentData();

        return Inertia::render('Dossier/DossierPage', [
            'property' => $safePropertyData,
            'agent' => $agentData
        ]);
    }
}
