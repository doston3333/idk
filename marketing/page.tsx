'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Gift, 
  Share2, 
  TrendingUp, 
  Users, 
  Target,
  Trophy,
  Star,
  Zap,
  Crown,
  Calendar,
  MapPin
} from 'lucide-react';
import ReferralProgram from '@/components/ReferralProgram';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import { useAuth } from '@/contexts/auth-context';

export default function MarketingPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const campaigns = [
    {
      id: 1,
      title: "Swipe Week Challenge",
      description: "Swipe 100 dishes in a week and win exclusive rewards",
      badge: "Limited Time",
      icon: Trophy,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      endDate: "2024-02-01",
      participants: 1234,
      reward: "Free Premium Month"
    },
    {
      id: 2,
      title: "Campus Foodie Ambassador",
      description: "Become a campus ambassador and earn perks",
      badge: "Campus Program",
      icon: Crown,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      endDate: "Ongoing",
      participants: 89,
      reward: "Exclusive Events + Commission"
    },
    {
      id: 3,
      title: "Foodie Influencer Program",
      description: "Share your favorite dishes and grow your following",
      badge: "Influencer",
      icon: Star,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      endDate: "Ongoing",
      participants: 456,
      reward: "Sponsored Posts + Free Meals"
    }
  ];

  const stats = [
    { label: "Active Users", value: "12.5K", change: "+12%", icon: Users },
    { label: "Daily Swipes", value: "45.2K", change: "+8%", icon: Target },
    { label: "Referrals", value: "3.2K", change: "+25%", icon: Gift },
    { label: "Conversion Rate", value: "4.8%", change: "+2%", icon: TrendingUp }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
        <div className="max-w-4xl mx-auto text-center py-20">
          <Gift className="h-16 w-16 mx-auto text-orange-600 mb-6" />
          <h1 className="text-4xl font-bold mb-4">Join Our Community</h1>
          <p className="text-xl text-gray-600 mb-8">
            Sign up to access referral programs, sharing features, and exclusive rewards
          </p>
          <Button size="lg" className="text-lg px-8">
            Sign Up Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold mb-4">Growth & Rewards</h1>
          <p className="text-xl text-gray-600">
            Share FoodieMatch, earn rewards, and track your impact
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="h-4 w-4 text-gray-600" />
                  <Badge variant="secondary" className="text-green-600">
                    {stat.change}
                  </Badge>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="referral">Referral</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('referral')}
                  >
                    <Gift className="mr-2 h-4 w-4" />
                    Create Referral Code
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('analytics')}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    View Analytics
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('campaigns')}
                  >
                    <Trophy className="mr-2 h-4 w-4" />
                    Join Campaigns
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Your Impact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Friends Invited</span>
                    <Badge variant="secondary">12</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Dishes Shared</span>
                    <Badge variant="secondary">48</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Clicks</span>
                    <Badge variant="secondary">156</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Rewards Earned</span>
                    <Badge className="bg-green-100 text-green-800">$45</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <p className="font-medium">Virtual Food Tasting</p>
                      <p className="text-sm text-gray-600">Feb 15, 2024 • 7:00 PM</p>
                    </div>
                    <Badge variant="outline">Join</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">Restaurant Partner Launch</p>
                      <p className="text-sm text-gray-600">Feb 20, 2024 • All Day</p>
                    </div>
                    <Badge variant="outline">RSVP</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referral">
            <ReferralProgram userId={user.id} />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard userId={user.id} />
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${campaign.bgColor}`}>
                        <campaign.icon className={`h-6 w-6 ${campaign.color}`} />
                      </div>
                      <Badge variant="secondary">{campaign.badge}</Badge>
                    </div>
                    <CardTitle className="text-lg">{campaign.title}</CardTitle>
                    <CardDescription>{campaign.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {campaign.participants} joined
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {campaign.endDate}
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">Reward:</p>
                      <p className="text-sm text-green-600 font-medium">{campaign.reward}</p>
                    </div>

                    <Button className="w-full">
                      Join Campaign
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-600" />
                  Local Events Near You
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Food Truck Festival</p>
                      <p className="text-sm text-gray-600">Central Park • This Weekend</p>
                    </div>
                    <Button variant="outline" size="sm">Attend</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Restaurant Week</p>
                      <p className="text-sm text-gray-600">Downtown • Feb 10-17</p>
                    </div>
                    <Button variant="outline" size="sm">Learn More</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}