
import React, { useEffect, useState } from 'react';
import MobileContainer from '@/components/MobileContainer';
import MobileOnlyNotice from '@/components/MobileOnlyNotice';
import Header from '@/components/Header';
import Navbar from '@/components/Navbar';
import { cn } from '@/lib/utils';
import { AlertCircle, Car } from 'lucide-react';
import api from '@/api/service';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface KendaraanItemProps {
  model: string;
  no_polisi: string;
  kondisi: string;
}

interface Kendaraan {
  id: number;
  model: string;
  no_polisi: string;
  kondisi: string;
}

const KendaraanItem = ({ model, no_polisi, kondisi }: KendaraanItemProps) => {
  return (
    <div className="border-b border-border last:border-b-0 transition-colors bg-primary/5">
      <div className="flex items-center space-x-4">
        <div className="m-2 rounded-full" >
          <Car className="h-20 w-20" />
        </div>
        <div className="space-y-2">
          <div className="mb-2" >
            <h1 className='text-lg font-bold'>{model}</h1>
          </div>
          <div className="flex items-center" >
            <p className='text-sm font-bold'>{no_polisi}</p>
            <span className={cn("text-sm bg-gray-200 rounded-sm px-2 font-bold ml-2", kondisi === 'Baik' ? 'text-green-500' : kondisi === 'Sedang' ? 'text-yellow-500' : 'text-red-500')}>{kondisi}</span>
          </div>
        </div>
      </div>
    </div>

  );
};

const List = () => {

  const { data, isLoading, isError, error } = useQuery({

    // Set the query key
    queryKey: ['kendaraan'],

    // Set the query function
    queryFn: async () => {
      const res = await api.get(`/kendaraan`);
      return res.data;
    }
  });


  return (
    <>
      {/* <MobileOnlyNotice /> */}

      <Header title="Kendaraan" />

      <MobileContainer className="pt-20 pb-28">
        <h2 className="section-title">List kendaraan</h2>

        <div className="bg-card rounded-2xl overflow-hidden card-shadow border border-border/50 animate-fade-in opacity-0" style={{ animationDelay: '100ms' }}>
          {isLoading && (
            <Card className='mb-5'>
              <div className="flex flex-col space-y-3  p-10">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-8 w-96" />
              </div>
            </Card>
          )}

          {/* Error State */}
          {isError && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Empty</AlertTitle>
              <AlertDescription>
                Error: {error.message}
              </AlertDescription>
            </Alert>

          )}

          {data?.length > 0 ?
            data?.map((item: any) => (
              <KendaraanItem
                key={item.id}
                model={item.model}
                no_polisi={item.no_polisi}
                kondisi={item.kondisi}
              />
            ))
            :
            (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Empty</AlertTitle>
                <AlertDescription>
                  Tidak ada data
                </AlertDescription>
              </Alert>
            )
          }
        </div>
      </MobileContainer>

      <Navbar />
    </>
  );
};

export default List;
