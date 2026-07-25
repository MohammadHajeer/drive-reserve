'use client';

import Image from 'next/image';
import { Users, Gauge, Fuel, Clock } from 'lucide-react';

interface CarSummaryCardProps {
  category?: string;
  name?: string;
  reservationId?: string;
  imageSrc?: string;
  seats?: number;
  drive?: string;
  engine?: string;
  range?: string;
}

export function CarSummaryCard({
  category = 'Luxury Performance',
  name = 'Tesla Model S Plaid',
  reservationId = 'RES-88219-DXB',
  imageSrc = 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80',
  seats = 5,
  drive = 'Automatic',
  engine = 'Electric',
  range = '396 mi',
}: CarSummaryCardProps) {
  return (
    <div className="bg-card text-card-foreground rounded-xl border p-6 shadow-sm">
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="relative w-full md:w-56 h-36 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          <Image
            src={imageSrc}
            alt={name}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex-1 w-full space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs uppercase tracking-wide bg-primary/10 text-primary font-semibold px-2.5 py-1 rounded-full">
                {category}
              </span>
              <h2 className="text-xl font-bold mt-2">{name}</h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                Reservation ID
              </span>
              <span className="text-xs font-mono font-medium text-foreground">
                {reservationId}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="bg-muted/40 border rounded-lg p-2.5 text-center">
              <Users className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
              <span className="text-[10px] text-muted-foreground block uppercase font-medium">
                Seats
              </span>
              <span className="text-xs font-semibold">{seats}</span>
            </div>

            <div className="bg-muted/40 border rounded-lg p-2.5 text-center">
              <Gauge className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
              <span className="text-[10px] text-muted-foreground block uppercase font-medium">
                Drive
              </span>
              <span className="text-xs font-semibold">{drive}</span>
            </div>

            <div className="bg-muted/40 border rounded-lg p-2.5 text-center">
              <Fuel className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
              <span className="text-[10px] text-muted-foreground block uppercase font-medium">
                Engine
              </span>
              <span className="text-xs font-semibold">{engine}</span>
            </div>

            <div className="bg-muted/40 border rounded-lg p-2.5 text-center">
              <Clock className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
              <span className="text-[10px] text-muted-foreground block uppercase font-medium">
                Range
              </span>
              <span className="text-xs font-semibold">{range}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}