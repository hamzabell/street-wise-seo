'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';


export default function SecurityPage() {
  return (
    <section className="flex-1 p-4 lg:p-8 mobile-content-safe">
      <h1 className="text-lg lg:text-2xl font-medium bold text-gray-900 mb-8">
        Security Settings
      </h1>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Account Deletion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Account deletion is handled through Supabase for security reasons.
                Please contact support or access your Supabase dashboard to manage account deletion.
              </p>
              <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-4 rounded-lg">
                <Info className="h-5 w-5" />
                <p className="text-sm">
                  For immediate assistance with account deletion, please contact our support team.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
