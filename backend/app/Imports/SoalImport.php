<?php

namespace App\Imports;

use App\Models\Soal;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Illuminate\Support\Collection;

class SoalImport implements ToCollection, WithHeadingRow, WithValidation, SkipsEmptyRows
{
    private int $kategoriId;
    private int $importedCount = 0;
    private array $importedIds = [];

    public function __construct(int $kategoriId)
    {
        $this->kategoriId = $kategoriId;
    }

    public function collection(Collection $rows): void
    {
        foreach ($rows as $row) {
            $soal = Soal::create([
                'kategori_id'   => $this->kategoriId,
                'pertanyaan'    => $row['pertanyaan'],
                'pilihan_a'     => $row['pilihan_a'],
                'pilihan_b'     => $row['pilihan_b'],
                'pilihan_c'     => $row['pilihan_c'],
                'pilihan_d'     => $row['pilihan_d'],
                'pilihan_e'     => $row['pilihan_e'] ?? null,
                'kunci_jawaban' => strtoupper(trim($row['kunci_jawaban'])),
                'pembahasan'    => $row['pembahasan'] ?? null,
                'bobot'         => $row['bobot'] ?? 1,
            ]);

            $this->importedIds[] = $soal->id;
            $this->importedCount++;
        }
    }

    public function rules(): array
    {
        return [
            'pertanyaan'    => 'required|string',
            'pilihan_a'     => 'required|string',
            'pilihan_b'     => 'required|string',
            'pilihan_c'     => 'required|string',
            'pilihan_d'     => 'required|string',
            'pilihan_e'     => 'nullable|string',
            'kunci_jawaban' => 'required|in:A,B,C,D,E,a,b,c,d,e',
            'pembahasan'    => 'nullable|string',
            'bobot'         => 'nullable|integer|min:1',
        ];
    }

    public function getImportedCount(): int
    {
        return $this->importedCount;
    }

    public function getImportedIds(): array
    {
        return $this->importedIds;
    }
}
