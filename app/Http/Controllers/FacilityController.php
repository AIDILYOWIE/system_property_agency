<?php

namespace App\Http\Controllers;

use App\Models\Facility;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FacilityController extends Controller
{
    public function index()
    {
        $facilities = Facility::all();

        return Inertia::render('Settings/Index', [
            'facilities' => $facilities
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string|max:100',
            'name' => 'required|string|max:100',
            'icon_name' => 'required|string|max:100',
        ]);

        Facility::create($validated);

        return redirect()->back()->with('success', 'Fasilitas berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'category' => 'required|string|max:100',
            'name' => 'required|string|max:100',
            'icon_name' => 'required|string|max:100',
        ]);

        $facility = Facility::findOrFail($id);
        $facility->update($validated);

        return redirect()->back()->with('success', 'Fasilitas berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $facility = Facility::findOrFail($id);
        $facility->delete();

        return redirect()->back()->with('success', 'Fasilitas berhasil dihapus.');
    }
}
