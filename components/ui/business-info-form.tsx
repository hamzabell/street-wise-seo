'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Loader2,
  MapPin,
  Phone,
  Globe,
  Mail,
  Clock,
  Tag,
  DollarSign,
  CreditCard,
  Languages,
  Calendar,
  Users,
  Star,
  Info,
  Plus,
  X,
  ChevronDown
} from 'lucide-react';
import { BusinessInfoSchema, BusinessInfo } from '@/lib/seo/schema-generator';
import { cn } from '@/lib/utils';

// Extended schema for form validation with better UX
const BusinessInfoFormSchema = BusinessInfoSchema.extend({
  openingHours: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  serviceCategories: z.array(z.string()).optional(),
  paymentAccepted: z.array(z.string()).optional(),
  languagesSpoken: z.array(z.string()).optional(),
});

type BusinessInfoForm = z.infer<typeof BusinessInfoFormSchema>;

interface BusinessInfoFormProps {
  onSubmit: (data: BusinessInfo) => Promise<void>;
  isGenerating?: boolean;
  initialData?: Partial<BusinessInfo>;
  extractedInfo?: Partial<BusinessInfo>;
  onSaveInfo?: (data: BusinessInfo) => Promise<void>;
  className?: string;
}

const BUSINESS_TYPES = [
  'Plumbing Service',
  'Electrical Service',
  'HVAC Service',
  'Roofing Service',
  'Landscaping Service',
  'Cleaning Service',
  'Painting Service',
  'Moving Company',
  'Pest Control Service',
  'Restaurant',
  'Cafe',
  'Fitness Center',
  'Salon',
  'Auto Repair',
  'Dentist',
  'Doctor',
  'Veterinary',
  'Legal Service',
  'Accounting Service',
  'Consulting',
  'Real Estate',
  'Insurance',
  'Photography',
  'Education',
  'Tutoring',
  'Childcare',
  'Pet Grooming',
  'Dry Cleaning',
  'Storage Facility',
  'Other'
];

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NZ', name: 'New Zealand' }
];

const PAYMENT_METHODS = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Check',
  'Bank Transfer',
  'PayPal',
  'Apple Pay',
  'Google Pay',
  'Venmo',
  'Zelle',
  'Cryptocurrency',
  'Financing Available'
];

const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Chinese',
  'Japanese',
  'Korean',
  'Vietnamese',
  'Arabic',
  'Russian',
  'Polish',
  'Dutch',
  'Swedish'
];

const DEFAULT_OPENING_HOURS = [
  'Mo 09:00-17:00',
  'Tu 09:00-17:00',
  'We 09:00-17:00',
  'Th 09:00-17:00',
  'Fr 09:00-17:00',
  'Sa 09:00-15:00',
  'Su 00:00-00:00'
];

export function BusinessInfoForm({
  onSubmit,
  isGenerating = false,
  initialData,
  extractedInfo,
  onSaveInfo,
  className
}: BusinessInfoFormProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [newKeyword, setNewKeyword] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [customOpeningHours, setCustomOpeningHours] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset,
  } = useForm<BusinessInfoForm>({
    resolver: zodResolver(BusinessInfoFormSchema),
    mode: 'onChange',
    defaultValues: {
      address: {
        addressCountry: 'US'
      },
      ...initialData,
      ...extractedInfo,
      openingHours: DEFAULT_OPENING_HOURS,
      keywords: [],
      serviceCategories: [],
      paymentAccepted: [],
      languagesSpoken: []
    }
  });

  const watchedValues = watch();

  // Update form when extracted info changes
  useEffect(() => {
    if (extractedInfo) {
      Object.entries(extractedInfo).forEach(([key, value]) => {
        if (value !== undefined) {
          setValue(key as any, value);
        }
      });
    }
  }, [extractedInfo, setValue]);

  // Update opening hours when switching between default and custom
  useEffect(() => {
    if (!customOpeningHours && !watchedValues.openingHours?.some(h => h !== '00:00-00:00')) {
      setValue('openingHours', DEFAULT_OPENING_HOURS);
    }
  }, [customOpeningHours, setValue, watchedValues.openingHours]);

  const addArrayItem = (field: keyof BusinessInfoForm, value: string, setValueFn: Function) => {
    const currentArray = watchedValues[field] as string[] || [];
    if (value && !currentArray.includes(value.trim())) {
      setValueFn(field, [...currentArray, value.trim()]);
    }
  };

  const removeArrayItem = (field: keyof BusinessInfoForm, index: number, setValueFn: Function) => {
    const currentArray = watchedValues[field] as string[] || [];
    const newArray = currentArray.filter((_, i) => i !== index);
    setValueFn(field, newArray);
  };

  const handleAddKeyword = () => {
    addArrayItem('keywords', newKeyword, setValue);
    setNewKeyword('');
  };

  const handleAddServiceCategory = () => {
    addArrayItem('serviceCategories', newServiceCategory, setValue);
    setNewServiceCategory('');
  };

  const handleAddPaymentMethod = (method: string) => {
    addArrayItem('paymentAccepted', method, setValue);
    setNewPaymentMethod('');
  };

  const handleAddLanguage = (language: string) => {
    addArrayItem('languagesSpoken', language, setValue);
    setNewLanguage('');
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="businessName" className="text-base font-medium">
            Business Name *
          </Label>
          <Input
            id="businessName"
            placeholder="e.g., Smith Plumbing Services"
            {...register('businessName')}
            disabled={isGenerating}
            className="text-base h-11"
          />
          {errors.businessName && (
            <p className="text-sm text-destructive">{errors.businessName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessType" className="text-base font-medium">
            Business Type *
          </Label>
          <Select
            value={watchedValues.businessType || ''}
            onValueChange={(value) => setValue('businessType', value)}
            disabled={isGenerating}
          >
            <SelectTrigger className="text-base h-11">
              <SelectValue placeholder="Select business type..." />
            </SelectTrigger>
            <SelectContent>
              {BUSINESS_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.businessType && (
            <p className="text-sm text-destructive">{errors.businessType.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-base font-medium">
          Business Description *
        </Label>
        <Textarea
          id="description"
          placeholder="Describe your business, services, and what makes you unique..."
          className="min-h-[100px] resize-none"
          {...register('description')}
          disabled={isGenerating}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Be descriptive and include your main services (minimum 10 characters)
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="websiteUrl" className="text-base font-medium flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Website URL
          </Label>
          <Input
            id="websiteUrl"
            placeholder="https://yourwebsite.com"
            {...register('websiteUrl')}
            disabled={isGenerating}
            className="text-base h-11"
          />
          {errors.websiteUrl && (
            <p className="text-sm text-destructive">{errors.websiteUrl.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="telephone" className="text-base font-medium flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Phone Number *
          </Label>
          <Input
            id="telephone"
            placeholder="(555) 123-4567"
            {...register('telephone')}
            disabled={isGenerating}
            className="text-base h-11"
          />
          {errors.telephone && (
            <p className="text-sm text-destructive">{errors.telephone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-base font-medium flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="contact@yourbusiness.com"
            {...register('email')}
            disabled={isGenerating}
            className="text-base h-11"
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderAddressInfo = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Business Address *
        </h3>

        <div className="space-y-2">
          <Label htmlFor="streetAddress" className="text-base font-medium">
            Street Address *
          </Label>
          <Input
            id="streetAddress"
            placeholder="123 Main Street"
            {...register('address.streetAddress')}
            disabled={isGenerating}
            className="text-base h-11"
          />
          {errors.address?.streetAddress && (
            <p className="text-sm text-destructive">{errors.address.streetAddress.message}</p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="addressLocality" className="text-base font-medium">
              City *
            </Label>
            <Input
              id="addressLocality"
              placeholder="New York"
              {...register('address.addressLocality')}
              disabled={isGenerating}
              className="text-base h-11"
            />
            {errors.address?.addressLocality && (
              <p className="text-sm text-destructive">{errors.address.addressLocality.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressRegion" className="text-base font-medium">
              State/Province *
            </Label>
            <Input
              id="addressRegion"
              placeholder="NY"
              {...register('address.addressRegion')}
              disabled={isGenerating}
              className="text-base h-11"
            />
            {errors.address?.addressRegion && (
              <p className="text-sm text-destructive">{errors.address.addressRegion.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode" className="text-base font-medium">
              Postal Code *
            </Label>
            <Input
              id="postalCode"
              placeholder="10001"
              {...register('address.postalCode')}
              disabled={isGenerating}
              className="text-base h-11"
            />
            {errors.address?.postalCode && (
              <p className="text-sm text-destructive">{errors.address.postalCode.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="addressCountry" className="text-base font-medium">
            Country *
          </Label>
          <Select
            value={watchedValues.address?.addressCountry || 'US'}
            onValueChange={(value) => setValue('address.addressCountry', value)}
            disabled={isGenerating}
          >
            <SelectTrigger className="text-base h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.address?.addressCountry && (
            <p className="text-sm text-destructive">{errors.address.addressCountry.message}</p>
          )}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Geographic Coordinates (Optional)</h3>
        <p className="text-sm text-muted-foreground">
          Help search engines pinpoint your exact location. You can find coordinates using Google Maps.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="latitude" className="text-base font-medium">
              Latitude
            </Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              placeholder="40.7128"
              {...register('geo.latitude', { valueAsNumber: true })}
              disabled={isGenerating}
              className="text-base h-11"
            />
            {errors.geo?.latitude && (
              <p className="text-sm text-destructive">{errors.geo.latitude.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="longitude" className="text-base font-medium">
              Longitude
            </Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              placeholder="-74.0060"
              {...register('geo.longitude', { valueAsNumber: true })}
              disabled={isGenerating}
              className="text-base h-11"
            />
            {errors.geo?.longitude && (
              <p className="text-sm text-destructive">{errors.geo.longitude.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderBusinessDetails = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Opening Hours
        </h3>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Specify your business operating hours
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCustomOpeningHours(!customOpeningHours)}
          >
            {customOpeningHours ? 'Use Default' : 'Custom Hours'}
          </Button>
        </div>

        {customOpeningHours ? (
          <div className="space-y-2">
            <Label className="text-base font-medium">
              Custom Opening Hours (Format: "Mo 09:00-17:00")
            </Label>
            <Textarea
              placeholder="Mo 09:00-17:00&#10;Tu 09:00-17:00&#10;We 09:00-17:00&#10;Th 09:00-17:00&#10;Fr 09:00-17:00&#10;Sa 09:00-15:00&#10;Su 00:00-00:00"
              className="font-mono text-sm min-h-[150px]"
              value={watchedValues.openingHours?.join('\n') || ''}
              onChange={(e) => setValue('openingHours', e.target.value.split('\n').filter(h => h.trim()))}
              disabled={isGenerating}
            />
            <p className="text-xs text-muted-foreground">
              Use Mo, Tu, We, Th, Fr, Sa, Su for days. 00:00-00:00 means closed.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Default Hours:</p>
            <div className="text-sm space-y-1 font-mono">
              {DEFAULT_OPENING_HOURS.map((hours, index) => (
                <div key={index}>{hours}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Tag className="h-5 w-5" />
          SEO Keywords
        </h3>
        <p className="text-sm text-muted-foreground">
          Add keywords that customers might use to find your business
        </p>

        <div className="flex gap-2">
          <Input
            placeholder="e.g., emergency plumbing, pipe repair"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddKeyword();
              }
            }}
            disabled={isGenerating}
            className="text-base h-11"
          />
          <Button
            type="button"
            onClick={handleAddKeyword}
            disabled={!newKeyword.trim() || isGenerating}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {watchedValues.keywords && watchedValues.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {watchedValues.keywords.map((keyword, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {keyword}
                <button
                  type="button"
                  onClick={() => removeArrayItem('keywords', index, setValue)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Additional Business Details</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="serviceArea" className="text-base font-medium">
              Service Area
            </Label>
            <Input
              id="serviceArea"
              placeholder="e.g., 25 miles, Brooklyn and Queens"
              {...register('serviceArea')}
              disabled={isGenerating}
              className="text-base h-11"
            />
            <p className="text-xs text-muted-foreground">
              Describe the geographic area you serve
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priceRange" className="text-base font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Price Range
            </Label>
            <Select
              value={watchedValues.priceRange || ''}
              onValueChange={(value) => setValue('priceRange', value)}
              disabled={isGenerating}
            >
              <SelectTrigger className="text-base h-11">
                <SelectValue placeholder="Select price range..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="$">$ - Budget-friendly</SelectItem>
                <SelectItem value="$$">$$ - Moderate</SelectItem>
                <SelectItem value="$$$">$$$ - Expensive</SelectItem>
                <SelectItem value="$$$$">$$$$ - Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="foundedYear" className="text-base font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Founded Year
            </Label>
            <Input
              id="foundedYear"
              type="number"
              placeholder="2010"
              {...register('foundedYear', { valueAsNumber: true })}
              disabled={isGenerating}
              className="text-base h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="employeeCount" className="text-base font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Employee Count
            </Label>
            <Input
              id="employeeCount"
              type="number"
              placeholder="5-10"
              {...register('employeeCount', { valueAsNumber: true })}
              disabled={isGenerating}
              className="text-base h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ratingValue" className="text-base font-medium flex items-center gap-2">
              <Star className="h-4 w-4" />
              Average Rating
            </Label>
            <Input
              id="ratingValue"
              type="number"
              step="0.1"
              min="1"
              max="5"
              placeholder="4.5"
              {...register('ratingValue', { valueAsNumber: true })}
              disabled={isGenerating}
              className="text-base h-11"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderServicesPayments = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Service Categories</h3>
        <p className="text-sm text-muted-foreground">
          List the main services your business offers
        </p>

        <div className="flex gap-2">
          <Input
            placeholder="e.g., Residential Plumbing, Commercial Services"
            value={newServiceCategory}
            onChange={(e) => setNewServiceCategory(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddServiceCategory();
              }
            }}
            disabled={isGenerating}
            className="text-base h-11"
          />
          <Button
            type="button"
            onClick={handleAddServiceCategory}
            disabled={!newServiceCategory.trim() || isGenerating}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {watchedValues.serviceCategories && watchedValues.serviceCategories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {watchedValues.serviceCategories.map((category, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {category}
                <button
                  type="button"
                  onClick={() => removeArrayItem('serviceCategories', index, setValue)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Accepted Payment Methods
        </h3>

        <div className="grid gap-2">
          {PAYMENT_METHODS.map((method) => {
            const isSelected = watchedValues.paymentAccepted?.includes(method);
            return (
              <Button
                key={method}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (isSelected) {
                    removeArrayItem('paymentAccepted', watchedValues.paymentAccepted!.indexOf(method), setValue);
                  } else {
                    handleAddPaymentMethod(method);
                  }
                }}
                disabled={isGenerating}
                className="justify-start"
              >
                {method}
              </Button>
            );
          })}
        </div>

        {watchedValues.paymentAccepted && watchedValues.paymentAccepted.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {watchedValues.paymentAccepted.map((method, index) => (
              <Badge key={index} variant="default" className="flex items-center gap-1">
                {method}
                <button
                  type="button"
                  onClick={() => removeArrayItem('paymentAccepted', index, setValue)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Languages className="h-5 w-5" />
          Languages Spoken
        </h3>

        <div className="grid gap-2">
          {LANGUAGES.map((language) => {
            const isSelected = watchedValues.languagesSpoken?.includes(language);
            return (
              <Button
                key={language}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (isSelected) {
                    removeArrayItem('languagesSpoken', watchedValues.languagesSpoken!.indexOf(language), setValue);
                  } else {
                    handleAddLanguage(language);
                  }
                }}
                disabled={isGenerating}
                className="justify-start"
              >
                {language}
              </Button>
            );
          })}
        </div>

        {watchedValues.languagesSpoken && watchedValues.languagesSpoken.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {watchedValues.languagesSpoken.map((language, index) => (
              <Badge key={index} variant="default" className="flex items-center gap-1">
                {language}
                <button
                  type="button"
                  onClick={() => removeArrayItem('languagesSpoken', index, setValue)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Card className={cn('w-full max-w-4xl mx-auto', className)}>
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Globe className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Generate Local Business Schema</CardTitle>
        <CardDescription>
          Create structured data to improve your local search visibility on Google
        </CardDescription>

        {extractedInfo && Object.keys(extractedInfo).length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <Info className="h-4 w-4" />
              <span className="text-sm font-medium">
                Business information pre-filled from your topic generation
              </span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic" className="text-xs">Basic Info</TabsTrigger>
              <TabsTrigger value="address" className="text-xs">Address</TabsTrigger>
              <TabsTrigger value="details" className="text-xs">Details</TabsTrigger>
              <TabsTrigger value="services" className="text-xs">Services</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-6">
              {renderBasicInfo()}
            </TabsContent>

            <TabsContent value="address" className="mt-6">
              {renderAddressInfo()}
            </TabsContent>

            <TabsContent value="details" className="mt-6">
              {renderBusinessDetails()}
            </TabsContent>

            <TabsContent value="services" className="mt-6">
              {renderServicesPayments()}
            </TabsContent>
          </Tabs>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
            <Button
              type="submit"
              className="flex-1 h-12 text-base font-medium"
              disabled={!isValid || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Schema...
                </>
              ) : (
                <>
                  <Globe className="mr-2 h-4 w-4" />
                  Generate Business Schema
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={isGenerating}
            >
              Reset Form
            </Button>
          </div>

          {!isValid && (
            <div className="text-center text-sm text-destructive">
              Please fill in all required fields marked with *
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}