import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const timeframe = searchParams.get('timeframe') || '30'; // days
    const eventType = searchParams.get('eventType');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeframe));

    // Build where clause
    const whereClause: any = {
      createdAt: { gte: daysAgo }
    };

    if (eventType) {
      whereClause.eventType = eventType;
    }

    // Get user's referral stats
    const referralCode = await db.referralCode.findFirst({
      where: { referrerId: userId },
      include: {
        coupons: {
          where: { createdAt: { gte: daysAgo } }
        }
      }
    });

    // Get analytics events
    const events = await db.analyticsEvent.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    // Get user's share actions
    const shareActions = await db.shareAction.findMany({
      where: { 
        userId,
        createdAt: { gte: daysAgo }
      },
      include: {
        dish: { select: { name: true } },
        restaurant: { select: { name: true } }
      }
    });

    // Calculate metrics
    const totalEvents = events.length;
    const totalShares = shareActions.length;
    const totalClicks = shareActions.reduce((sum, share) => sum + share.clicks, 0);
    const totalConversions = shareActions.reduce((sum, share) => sum + share.conversions, 0);

    // Event type breakdown
    const eventTypeBreakdown = events.reduce((acc: any, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {});

    // Platform breakdown for shares
    const platformBreakdown = shareActions.reduce((acc: any, share) => {
      acc[share.platform] = (acc[share.platform] || 0) + 1;
      return acc;
    }, {});

    // Daily activity for the last 7 days
    const dailyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const dayEvents = await db.analyticsEvent.count({
        where: {
          createdAt: { gte: dayStart, lte: dayEnd }
        }
      });

      dailyActivity.push({
        date: dayStart.toISOString().split('T')[0],
        events: dayEvents
      });
    }

    // Referral performance
    let referralPerformance = null;
    if (referralCode) {
      referralPerformance = {
        code: referralCode.code,
        totalCoupons: referralCode.coupons.length,
        usedCoupons: referralCode.coupons.filter(c => c.isUsed).length,
        conversionRate: referralCode.coupons.length > 0 
          ? (referralCode.coupons.filter(c => c.isUsed).length / referralCode.coupons.length) * 100 
          : 0
      };
    }

    return NextResponse.json({
      timeframe: `${timeframe} days`,
      summary: {
        totalEvents,
        totalShares,
        totalClicks,
        totalConversions,
        clickThroughRate: totalShares > 0 ? (totalClicks / totalShares) * 100 : 0,
        conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0
      },
      breakdowns: {
        eventTypes: eventTypeBreakdown,
        platforms: platformBreakdown
      },
      dailyActivity,
      referralPerformance,
      recentEvents: events.slice(0, 10),
      recentShares: shareActions.slice(0, 10)
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, eventType, eventName, properties, value, currency } = await request.json();

    if (!userId || !eventType || !eventName) {
      return NextResponse.json({ 
        error: 'User ID, event type, and event name are required' 
      }, { status: 400 });
    }

    // Get client info
    const clientInfo = request.headers.get('user-agent') || '';
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';

    const event = await db.analyticsEvent.create({
      data: {
        userId,
        eventType,
        eventName,
        properties: properties ? JSON.stringify(properties) : null,
        value,
        currency,
        ipAddress: ip,
        userAgent: clientInfo,
      }
    });

    return NextResponse.json({
      event: {
        id: event.id,
        eventType: event.eventType,
        eventName: event.eventName,
        createdAt: event.createdAt
      },
      message: 'Event tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}