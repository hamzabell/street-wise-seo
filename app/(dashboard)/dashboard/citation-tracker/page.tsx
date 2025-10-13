'use client';

import { useState, useEffect, Suspense } from 'react';
import { CitationTracker } from '@/components/ui/citation-tracker';
import { LoadingPage } from '@/components/ui/loading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building,
  MapPin,
  Phone,
  Globe,
  Settings,
  CheckCircle,
  AlertCircle,
  Info,
  Save,
} from 'lucide-react';
// // import { getSession } from '@/lib/auth/session';

interface BusinessProfile {
  name: string;
  address: string;
  phone: string;
  website: string;
  description: string;
  categories: string[];
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

function CitationTrackerContent() {
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState<BusinessProfile>({
    name: '',
    address: '',
    phone: '',
    website: '',
    description: '',
    categories: [],
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  useEffect(() => {
    loadBusinessProfile();
  }, []);

  const loadBusinessProfile = async () => {
    try {
      // const session = await getSession();
      // if (!session) {
      //   setError('Please log in to access the citation tracker');
      //   setIsLoading(false);
      //   return;
      // }

      const response = await fetch('/api/user');
      if (response.ok) {
        const userData = await response.json();
        if (userData.data) {
          const user = userData.data;
          const profile: BusinessProfile = {
            name: user.businessName || user.name || '',
            address: user.businessAddress || '',
            phone: user.businessPhone || '',
            website: user.businessWebsite || user.primaryWebsiteUrl || '',
            description: user.businessDescription || '',
            categories: user.businessCategories ? JSON.parse(user.businessCategories) : [],
            city: user.businessCity || '',
            state: user.businessState || '',
            zipCode: user.businessZipCode || '',
            country: user.businessCountry || '',
          };
          setBusinessProfile(profile);
          setProfileForm(profile);
        }
      } else {
        setError('Failed to load business profile');
      }
    } catch (error) {
      console.error('Failed to load business profile:', error);
      setError('Failed to load business profile');
    } finally {
      setIsLoading(false);
    }
  };

  const saveBusinessProfile = async () => {
    if (!profileForm.name || !profileForm.address || !profileForm.phone) {
      setError('Please fill in the required fields: Business Name, Address, and Phone');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: profileForm.name,
          businessAddress: profileForm.address,
          businessPhone: profileForm.phone,
          businessWebsite: profileForm.website,
          businessDescription: profileForm.description,
          businessCategories: JSON.stringify(profileForm.categories),
          businessCity: profileForm.city,
          businessState: profileForm.state,
          businessZipCode: profileForm.zipCode,
          businessCountry: profileForm.country,
        }),
      });

      if (response.ok) {
        setBusinessProfile(profileForm);
        setIsEditingProfile(false);
        setSuccessMessage('Business profile updated successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save business profile');
      }
    } catch (error) {
      console.error('Failed to save business profile:', error);
      setError('Failed to save business profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCategoryAdd = (category: string) => {
    if (category && !profileForm.categories.includes(category)) {
      setProfileForm(prev => ({
        ...prev,
        categories: [...prev.categories, category]
      }));
    }
  };

  const handleCategoryRemove = (category: string) => {
    setProfileForm(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== category)
    }));
  };

  const calculateProfileCompleteness = (profile: BusinessProfile | null): number => {
    if (!profile) return 0;

    let score = 0;
    const maxScore = 100;

    // Required fields (50 points)
    if (profile.name && profile.name.trim()) score += 15;
    if (profile.address && profile.address.trim()) score += 15;
    if (profile.phone && profile.phone.trim()) score += 10;
    if (profile.website && profile.website.trim()) score += 10;

    // Important fields (30 points)
    if (profile.description && profile.description.trim() && profile.description.length > 50) score += 15;
    if (profile.categories && profile.categories.length > 0) score += 10;
    if (profile.city && profile.city.trim()) score += 5;

    // Additional fields (20 points)
    if (profile.state && profile.state.trim()) score += 5;
    if (profile.zipCode && profile.zipCode.trim()) score += 5;
    if (profile.country && profile.country.trim()) score += 5;
    if (profile.categories && profile.categories.length >= 3) score += 5;

    return Math.min(score, maxScore);
  };

  const getCompletenessBadge = (score: number) => {
    if (score >= 90) {
      return { text: 'Excellent', color: 'bg-green-100 text-green-800' };
    } else if (score >= 75) {
      return { text: 'Good', color: 'bg-blue-100 text-blue-800' };
    } else if (score >= 50) {
      return { text: 'Fair', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { text: 'Needs Work', color: 'bg-red-100 text-red-800' };
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <LoadingPage text="Loading Citation Tracker..." />
      </div>
    );
  }

  return (
    <div className="w-full max-w-full space-y-6 overflow-y-auto h-full pb-8 scrollbar-hide">
      {/* Header */}
      <div className="text-center space-y-4 px-4 py-6">
        <div className="flex items-center justify-center gap-2">
          <div className="p-3 bg-primary/10 rounded-full">
            <Building className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">Local Citation Tracker</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
          Build and manage your local business listings across major directories.
          Improve your local SEO visibility with consistent business information.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="px-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {successMessage && (
        <div className="px-4">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="px-4">
        {!businessProfile || isEditingProfile ? (
          /* Business Profile Form */
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Business Profile Setup
              </CardTitle>
              <CardDescription>
                {isEditingProfile ? 'Update your business information' : 'Complete your business profile to get started with citation tracking'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic Information</TabsTrigger>
                  <TabsTrigger value="details">Additional Details</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="business-name">Business Name *</Label>
                      <Input
                        id="business-name"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Your Business Name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="business-phone">Phone Number *</Label>
                      <Input
                        id="business-phone"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="business-address">Address *</Label>
                    <Input
                      id="business-address"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="123 Main St, City, State 12345"
                    />
                  </div>

                  <div>
                    <Label htmlFor="business-website">Website</Label>
                    <Input
                      id="business-website"
                      value={profileForm.website}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="business-description">Business Description</Label>
                    <Textarea
                      id="business-description"
                      value={profileForm.description}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your business, services, and what makes you unique..."
                      rows={4}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="business-city">City</Label>
                      <Input
                        id="business-city"
                        value={profileForm.city}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <Label htmlFor="business-state">State</Label>
                      <Input
                        id="business-state"
                        value={profileForm.state}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <Label htmlFor="business-zip">ZIP Code</Label>
                      <Input
                        id="business-zip"
                        value={profileForm.zipCode}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, zipCode: e.target.value }))}
                        placeholder="12345"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="business-country">Country</Label>
                    <Input
                      id="business-country"
                      value={profileForm.country}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, country: e.target.value }))}
                      placeholder="United States"
                    />
                  </div>

                  <div>
                    <Label>Business Categories</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {profileForm.categories.map((category) => (
                        <Badge key={category} variant="secondary" className="cursor-pointer" onClick={() => handleCategoryRemove(category)}>
                          {category} ×
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add category (e.g., Plumbing, Restaurant)"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleCategoryAdd((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          handleCategoryAdd(input.value);
                          input.value = '';
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-between items-center mt-6 pt-6 border-t">
                <div className="text-sm text-muted-foreground">
                  <Info className="h-4 w-4 inline mr-1" />
                  Consistent business information improves local SEO rankings
                </div>
                <div className="flex gap-2">
                  {businessProfile && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setProfileForm(businessProfile);
                        setIsEditingProfile(false);
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button onClick={saveBusinessProfile} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {isEditingProfile ? 'Update Profile' : 'Save Profile'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Citation Tracker */
          <div className="space-y-6">
            {/* Business Profile Summary with Completeness Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Business Profile</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingProfile(true)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Profile Completeness Score */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {calculateProfileCompleteness(businessProfile)}%
                      </div>
                      <div>
                        <div className="font-medium text-sm">Profile Completeness</div>
                        <div className="text-xs text-muted-foreground">Complete profiles rank better in local search</div>
                      </div>
                    </div>
                    <Badge className={getCompletenessBadge(calculateProfileCompleteness(businessProfile)).color}>
                      {getCompletenessBadge(calculateProfileCompleteness(businessProfile)).text}
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${calculateProfileCompleteness(businessProfile)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building className="h-4 w-4" />
                      Business Name
                    </div>
                    <p className="font-medium">{businessProfile.name}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      Address
                    </div>
                    <p className="font-medium">{businessProfile.address}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      Phone
                    </div>
                    <p className="font-medium">{businessProfile.phone}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      Website
                    </div>
                    <p className="font-medium truncate">{businessProfile.website || 'Not provided'}</p>
                  </div>
                </div>
                {businessProfile.categories.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-sm text-muted-foreground mb-2">Categories</div>
                    <div className="flex flex-wrap gap-2">
                      {businessProfile.categories.map((category) => (
                        <Badge key={category} variant="outline">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Fields Suggestions */}
                {calculateProfileCompleteness(businessProfile) < 100 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-sm font-medium text-amber-700 mb-2">
                      <Info className="h-4 w-4 inline mr-1" />
                      Suggestions to improve your profile:
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      {!businessProfile.website && <div>• Add your website URL</div>}
                      {!businessProfile.description || businessProfile.description.length < 50 && <div>• Expand your business description (50+ characters)</div>}
                      {!businessProfile.city && <div>• Add your city</div>}
                      {!businessProfile.state && <div>• Add your state/province</div>}
                      {businessProfile.categories.length < 3 && <div>• Add more business categories</div>}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Citation Tracker Component */}
            <CitationTracker businessInfo={businessProfile} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function CitationTrackerPage() {
  return (
    <Suspense fallback={<LoadingPage text="Loading Citation Tracker..." />}>
      <CitationTrackerContent />
    </Suspense>
  );
}