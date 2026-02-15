// ═══════════════════════════════════════════════════════
// FINVISOR - Payment API Route
// Integrations: Fetch.ai (monetized agents)
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import {
  requestPayment,
  confirmPayment,
  createServiceOffer,
  getAgentAnalytics,
  FINVISOR_SERVICES,
} from '@/lib/fetchai';

interface PaymentRequest {
  userId: string;
  service: 'basic_appeal' | 'pro_appeal' | 'premium_appeal' | 'advisor_session';
  amount?: number;
}

// Request payment for a service
export async function POST(request: NextRequest) {
  try {
    const body: PaymentRequest = await request.json();
    const { userId, service, amount } = body;

    if (!userId || !service) {
      return NextResponse.json(
        { error: 'User ID and service required' },
        { status: 400 }
      );
    }

    // Validate service type
    const validServices = ['basic_appeal', 'pro_appeal', 'premium_appeal', 'advisor_session'];
    if (!validServices.includes(service)) {
      return NextResponse.json(
        { error: 'Invalid service type' },
        { status: 400 }
      );
    }

    // Request payment through Fetch.ai agent
    const paymentRequest = await requestPayment(
      userId,
      service as PaymentRequest['service'],
      amount || 0
    );

    // Get service details for response
    const serviceKey = service.replace('_appeal', '') as keyof typeof FINVISOR_SERVICES;
    const serviceDetails = FINVISOR_SERVICES[serviceKey] || FINVISOR_SERVICES.basic;

    return NextResponse.json({
      success: true,
      data: {
        paymentId: paymentRequest.id,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        status: paymentRequest.status,
        service: {
          name: serviceDetails.name,
          description: serviceDetails.description,
          deliverables: serviceDetails.deliverables,
        },
        checkoutUrl: `https://agentverse.ai/pay/${paymentRequest.id}`,
      },
    });
  } catch (error) {
    console.error('Payment request error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Payment request failed',
      },
      { status: 500 }
    );
  }
}

// Confirm payment status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');
    const action = searchParams.get('action');

    // Get pricing/services info
    if (action === 'pricing') {
      return NextResponse.json({
        success: true,
        data: {
          services: Object.entries(FINVISOR_SERVICES).map(([key, value]) => ({
            id: `${key}_appeal`,
            ...value,
          })),
        },
      });
    }

    // Get agent analytics
    if (action === 'analytics') {
      const analytics = await getAgentAnalytics();
      return NextResponse.json({
        success: true,
        data: analytics,
      });
    }

    // Confirm specific payment
    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID required' },
        { status: 400 }
      );
    }

    const confirmation = await confirmPayment(paymentId);

    return NextResponse.json({
      success: true,
      data: {
        confirmed: confirmation.confirmed,
        transactionHash: confirmation.transaction_hash,
        amount: confirmation.amount,
        status: confirmation.confirmed ? 'completed' : 'pending',
      },
    });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json(
      { success: false, error: 'Payment confirmation failed' },
      { status: 500 }
    );
  }
}

// Create service offer on marketplace
export async function PUT(request: NextRequest) {
  try {
    const body: {
      name: string;
      description: string;
      price: number;
      duration?: number;
      deliverables: string[];
    } = await request.json();

    const offer = await createServiceOffer(body);

    return NextResponse.json({
      success: true,
      data: {
        offerId: offer.offerId,
        listingUrl: offer.listingUrl,
        status: 'active',
      },
    });
  } catch (error) {
    console.error('Service offer error:', error);
    return NextResponse.json(
      { success: false, error: 'Offer creation failed' },
      { status: 500 }
    );
  }
}
