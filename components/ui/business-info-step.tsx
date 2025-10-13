'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Building,
  Check,
  AlertCircle,
  Info,
  ArrowRight,
  MapPin,
  Phone,
  Globe
} from 'lucide-react';

interface BusinessInfo {
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessWebsite: string;
  businessDescription: string;
  businessCategories: string[];
  businessCity: string;
  businessState: string;
  businessZipCode: string;
  businessCountry: string;
}

interface BusinessInfoStepProps {
  onComplete: () => void;
  onSkip?: () => void;
  initialCompleted: boolean;
}

const BUSINESS_CATEGORIES = [
  'Restaurant',
  'Retail',
  'Professional Services',
  'Healthcare',
  'Home Services',
  'Automotive',
  'Beauty & Wellness',
  'Fitness',
  'Education',
  'Legal',
  'Real Estate',
  'Construction',
  'Technology',
  'Marketing',
  'Financial Services',
  'Other'
];

const COUNTRIES = [
  'United States',
  'Canada',
  'United Kingdom',
  'Australia',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Japan',
  'Other'
];

export function BusinessInfoStep({
  onComplete,
  onSkip,
  initialCompleted
}: BusinessInfoStepProps) {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    businessName: '',
    businessAddress: '',
    businessPhone: '',
    businessWebsite: '',
    businessDescription: '',
    businessCategories: [],
    businessCity: '',
    businessState: '',
    businessZipCode: '',
    businessCountry: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(initialCompleted);
  const [savedInfo, setSavedInfo] = useState<Partial<BusinessInfo> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchExistingBusinessInfo();
  }, []);

  const fetchExistingBusinessInfo = async () => {
    try {
      const response = await fetch('/api/user/business-info');
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setSavedInfo(data.data);
          if (!initialCompleted) {
            setBusinessInfo(data.data);
            if (data.data.businessCategories && Array.isArray(data.data.businessCategories)) {
              setSelectedCategory(data.data.businessCategories[0] || '');
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch existing business info:', error);
    }
  };

  const handleSaveBusinessInfo = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/user/business-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(businessInfo),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSavedInfo(businessInfo);
        setIsSaved(true);
      } else {
        setError(data.error || 'Failed to save business information');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof BusinessInfo, value: string | string[]) => {
    setBusinessInfo(prev => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    handleInputChange('businessCategories', category ? [category] : []);
  };

  const isFormValid = () => {
    return (businessInfo.businessName?.trim() || '') !== '' ||
           (businessInfo.businessDescription?.trim() || '') !== '' ||
           (businessInfo.businessCategories?.length || 0) > 0;
  };

  if (isSaved && savedInfo) {
    return (
      <div className="text-center space-y-6 py-8">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-green-900">Business Information Saved!</h3>
            <p className="text-muted-foreground mt-2">
              Your business details will help us generate more relevant SEO topics.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <Building className="h-4 w-4" />
              <span className="font-medium">Business Information</span>
            </div>
            <div className="space-y-2 text-sm">
              {savedInfo.businessName?.trim() && (
                <p><strong>Name:</strong> {savedInfo.businessName}</p>
              )}
              {savedInfo.businessCategories && savedInfo.businessCategories.length > 0 && (
                <p><strong>Category:</strong> {savedInfo.businessCategories.join(', ')}</p>
              )}
              {savedInfo.businessCity?.trim() && savedInfo.businessState?.trim() && (
                <p><strong>Location:</strong> {savedInfo.businessCity}, {savedInfo.businessState}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={onComplete}
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              Continue to Next Step
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            {onSkip && (
              <Button
                variant="outline"
                onClick={onSkip}
                size="lg"
              >
                Skip This Step
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Tell Us About Your Business</h3>
        <p className="text-muted-foreground text-sm">
          Share some details about your business to help us generate more relevant SEO topics.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="business-name">Business Name</Label>
            <Input
              id="business-name"
              placeholder="Your business name"
              value={businessInfo.businessName}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div>
            <Label htmlFor="business-category">Business Category</Label>
            <Select value={selectedCategory} onValueChange={handleCategorySelect}>
              <SelectTrigger id="business-category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="business-description">Business Description</Label>
          <Textarea
            id="business-description"
            placeholder="Brief description of your business, services, or products..."
            value={businessInfo.businessDescription}
            onChange={(e) => handleInputChange('businessDescription', e.target.value)}
            disabled={isSaving}
            rows={3}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Help us understand what makes your business unique.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="business-phone">Phone Number</Label>
            <Input
              id="business-phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={businessInfo.businessPhone}
              onChange={(e) => handleInputChange('businessPhone', e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div>
            <Label htmlFor="business-website">Business Website</Label>
            <Input
              id="business-website"
              type="url"
              placeholder="https://www.example.com"
              value={businessInfo.businessWebsite}
              onChange={(e) => handleInputChange('businessWebsite', e.target.value)}
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Business Address</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Street address"
                  value={businessInfo.businessAddress}
                  onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                  disabled={isSaving}
                />
              </div>
              <div>
                <Input
                  placeholder="City"
                  value={businessInfo.businessCity}
                  onChange={(e) => handleInputChange('businessCity', e.target.value)}
                  disabled={isSaving}
                />
              </div>
              <div>
                <Input
                  placeholder="State/Province"
                  value={businessInfo.businessState}
                  onChange={(e) => handleInputChange('businessState', e.target.value)}
                  disabled={isSaving}
                />
              </div>
              <div>
                <Input
                  placeholder="ZIP/Postal code"
                  value={businessInfo.businessZipCode}
                  onChange={(e) => handleInputChange('businessZipCode', e.target.value)}
                  disabled={isSaving}
                />
              </div>
              <div>
                <Select
                  value={businessInfo.businessCountry}
                  onValueChange={(value) => handleInputChange('businessCountry', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-4 rounded-lg">
          <Info className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">
            Business information helps us generate location-specific and industry-relevant SEO topics.
          </p>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={handleSaveBusinessInfo}
          disabled={isSaving || !isFormValid()}
          size="lg"
          className="min-w-[200px]"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              Save Business Info
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
        {onSkip && (
          <Button
            variant="outline"
            onClick={onSkip}
            disabled={isSaving}
            size="lg"
          >
            Skip for Now
          </Button>
        )}
      </div>

      <div className="text-center">
        <Badge variant="secondary" className="text-xs">
          Optional step - you can always update business information later
        </Badge>
      </div>
    </div>
  );
}