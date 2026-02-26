import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { createElement } from 'react';
import { InspectionPdfDocument } from '@/components/inspection/InspectionPdfDocument';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  try {
    // Fetch inspection readiness data
    const readinessRes = await fetch(`${apiUrl}/inspection/readiness`, {
      headers: authHeader ? { Authorization: authHeader } : {},
    });

    if (!readinessRes.ok) {
      return NextResponse.json(
        { error: 'Impossible de charger les donnees d\'inspection' },
        { status: readinessRes.status },
      );
    }

    const readiness = await readinessRes.json();

    // Fetch company data (from profile)
    const profileRes = await fetch(`${apiUrl}/profile`, {
      headers: authHeader ? { Authorization: authHeader } : {},
    });
    const profile = profileRes.ok ? await profileRes.json() : null;

    const companyRes = profile?.company_id
      ? await fetch(`${apiUrl}/companies/${profile.company_id}`, {
          headers: authHeader ? { Authorization: authHeader } : {},
        })
      : null;
    const company = companyRes?.ok ? await companyRes.json() : null;

    const companyName = company?.name || 'Entreprise';

    // Generate PDF
    const element = createElement(InspectionPdfDocument, {
      data: readiness,
      companyName,
    });
    const buffer = await renderToBuffer(element as any);

    const now = new Date().toISOString().slice(0, 10);
    const filename = `Inspection_${companyName}_${now}.pdf`.replace(/\s+/g, '_');

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Inspection PDF generation error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la generation du PDF' },
      { status: 500 },
    );
  }
}
