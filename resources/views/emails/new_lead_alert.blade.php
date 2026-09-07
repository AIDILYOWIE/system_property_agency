<x-mail::message>
    # 🚨 New Lead Alert!

    Ada prospek baru yang tertarik dengan properti Anda.

    <x-mail::panel>
        **Data Pelanggan:**
        - **Nama Utama:** {{ $client->full_name }}
        - **Nomor WA:** {{ $client->phone }}
        - **Sumber:** {{ $client->source ?? 'Website Form' }}

        **Data Properti:**
        - **Properti Incaran:** {{ $inquiry->property->title ?? 'Minat Properti Umum' }}
        - **Lokasi Kawasan:** {{ optional($inquiry->property)->location_area ?? '-' }}
        - **Tipe Listing:** {{ $inquiry->property ? ucfirst($inquiry->property->listing_type) : '-' }}
        - **Harga:** {{ $inquiry->property ? $inquiry->property->currency . ' ' . number_format($inquiry->property->price, 0, ',', '.') : '-' }}
    </x-mail::panel>

    Klien ini sedang menunggu balasan Anda. Segera lakukan *follow-up* agar klien merasa dihargai dan mempercepat potensi *dealing*!

    <x-mail::button :url="$followUpUrl" color="success">
        Hubungi Klien via WA
    </x-mail::button>

    Gunakan tombol WhatsApp di atas untuk mengupdate status di sistem secara otomatis dan membuka draf chat Anda.

    Jika butuh melihat detail profilnya, klik [Buka Profil Klien]({{ $crmProfileUrl }}).

    Terima kasih,<br>
    {{ config('app.name') }}
</x-mail::message>