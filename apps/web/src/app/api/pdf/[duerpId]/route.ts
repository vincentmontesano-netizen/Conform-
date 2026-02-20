import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { createElement } from 'react';
import { DuerpPdfDocument } from '@/components/pdf/DuerpPdfDocument';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ duerpId: string }> },
) {
  const { duerpId } = await params;

  // Get auth token from cookie/header
  const authHeader = request.headers.get('authorization');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  try {
    // Fetch DUERP data from API
    const response = await fetch(`${apiUrl}/duerps/${duerpId}`, {
      headers: authHeader ? { Authorization: authHeader } : {},
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'DUERP non trouve' },
        { status: response.status },
      );
    }

    const duerp = await response.json();

    // Fetch company data
    const companyRes = await fetch(`${apiUrl}/companies/${duerp.company_id}`, {
      headers: authHeader ? { Authorization: authHeader } : {},
    });
    const company = companyRes.ok ? await companyRes.json() : null;

    // Generate PDF
    const element = createElement(DuerpPdfDocument, { duerp, company });
    const buffer = await renderToBuffer(element as any);

    const now = new Date().toISOString().slice(0, 10);
    const filename = `DUERP_${company?.name || 'export'}_${now}.pdf`.replace(/\s+/g, '_');

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la generation du PDF' },
      { status: 500 },
    );
  }
}
