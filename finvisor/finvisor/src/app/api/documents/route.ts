// ═══════════════════════════════════════════════════════
// FINVISOR - Document Processing API Route
// Integrations: OpenAI (vision), Modal (batch processing)
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { parseDocumentWithVision, extractStructuredData } from '@/lib/openai';
import { parseDocumentsBatch } from '@/lib/modal';

interface DocumentUpload {
  id: string;
  type: 'w2' | 'fafsa' | 'aid_letter' | 'tax_return' | 'other';
  content: string; // base64 or text
  contentType: 'image' | 'text' | 'pdf';
}

export async function POST(request: NextRequest) {
  try {
    const body: { documents: DocumentUpload[] } = await request.json();
    const { documents } = body;

    if (!documents || documents.length === 0) {
      return NextResponse.json(
        { error: 'Documents are required' },
        { status: 400 }
      );
    }

    // Process documents based on type
    const results = await Promise.all(
      documents.map(async (doc) => {
        try {
          let parsed;

          if (doc.contentType === 'image') {
            // Use OpenAI Vision for image documents
            parsed = await parseDocumentWithVision(doc.content, doc.type);
          } else if (doc.contentType === 'text') {
            // Use structured extraction for text
            const schema = getSchemaForDocType(doc.type);
            const extracted = await extractStructuredData(doc.content, schema);
            parsed = {
              fields: Object.entries(extracted).map(([key, value]) => ({
                key,
                value: String(value),
                confidence: 0.9,
              })),
              rawText: doc.content,
            };
          } else {
            // PDF - would need additional processing
            parsed = {
              fields: [],
              rawText: doc.content,
            };
          }

          // Add flags for important fields
          const flaggedFields = flagImportantFields(parsed.fields, doc.type);

          return {
            id: doc.id,
            type: doc.type,
            status: 'parsed' as const,
            parsedData: {
              type: getDocumentTypeName(doc.type),
              fields: flaggedFields,
              confidence: calculateConfidence(flaggedFields),
            },
          };
        } catch (error) {
          console.error(`Error parsing document ${doc.id}:`, error);
          return {
            id: doc.id,
            type: doc.type,
            status: 'error' as const,
            error: error instanceof Error ? error.message : 'Parse failed',
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: { documents: results },
    });
  } catch (error) {
    console.error('Document API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// Batch processing endpoint using Modal
export async function PUT(request: NextRequest) {
  try {
    const body: { documents: DocumentUpload[] } = await request.json();
    
    if (process.env.MODAL_TOKEN_ID) {
      // Use Modal for batch processing
      const modalDocs = body.documents.map((d) => ({
        id: d.id,
        content: d.content,
        type: d.type,
      }));

      const results = await parseDocumentsBatch(modalDocs);
      
      return NextResponse.json({
        success: true,
        data: { documents: results },
        metadata: { provider: 'modal' },
      });
    }

    // Fallback to standard processing
    return NextResponse.json({
      success: false,
      error: 'Modal not configured',
    }, { status: 503 });
  } catch (error) {
    console.error('Batch processing error:', error);
    return NextResponse.json(
      { success: false, error: 'Batch processing failed' },
      { status: 500 }
    );
  }
}

// Helper functions
function getSchemaForDocType(type: string): Record<string, unknown> {
  const schemas: Record<string, Record<string, unknown>> = {
    w2: {
      gross_income: 'number',
      federal_tax_withheld: 'number',
      employer_name: 'string',
      employment_dates: 'string',
      state_wages: 'number',
      state_tax: 'number',
    },
    fafsa: {
      efc: 'number',
      family_size: 'number',
      number_in_college: 'number',
      adjusted_gross_income: 'number',
      assets: 'number',
    },
    aid_letter: {
      total_cost: 'number',
      grants: 'number',
      scholarships: 'number',
      loans: 'number',
      work_study: 'number',
      total_aid: 'number',
      unmet_need: 'number',
    },
    tax_return: {
      adjusted_gross_income: 'number',
      taxable_income: 'number',
      total_tax: 'number',
      filing_status: 'string',
    },
  };
  return schemas[type] || {};
}

function getDocumentTypeName(type: string): string {
  const names: Record<string, string> = {
    w2: 'W-2 Form',
    fafsa: 'FAFSA Application',
    aid_letter: 'Financial Aid Letter',
    tax_return: 'Tax Return',
    other: 'Document',
  };
  return names[type] || 'Document';
}

function flagImportantFields(
  fields: Array<{ key: string; value: string; confidence: number }>,
  docType: string
): Array<{ key: string; value: string; confidence: number; flag?: boolean }> {
  const flaggableFields: Record<string, string[]> = {
    w2: ['gross_income', 'employment_dates'],
    fafsa: ['efc', 'adjusted_gross_income'],
    aid_letter: ['unmet_need', 'total_aid'],
    tax_return: ['adjusted_gross_income'],
  };

  const toFlag = flaggableFields[docType] || [];

  return fields.map((f) => ({
    ...f,
    flag: toFlag.some((flagKey) => 
      f.key.toLowerCase().includes(flagKey.toLowerCase())
    ),
  }));
}

function calculateConfidence(
  fields: Array<{ confidence: number }>
): number {
  if (fields.length === 0) return 0;
  const sum = fields.reduce((acc, f) => acc + f.confidence, 0);
  return Math.round((sum / fields.length) * 100) / 100;
}
