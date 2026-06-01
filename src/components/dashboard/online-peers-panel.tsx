import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface OnlinePeer {
  id: string;
  user: {
    name: string;
    email: string;
    image?: string;
  };
  role: string;
}

interface OnlinePeersPanelProps {
  peers: Array<{
    userId: string;
    user: {
      name: string;
      email: string;
      image?: string;
    };
    role: string;
  }>;
}

export function OnlinePeersPanel({ peers }: OnlinePeersPanelProps) {
  if (peers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Online Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No team members currently online</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Online Team Members</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {peers.map((peer) => (
          <div
            key={peer.userId}
            className="flex items-center justify-between gap-3 border-b pb-3 last:border-0"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={peer.user.image ?? ''} />
                  <AvatarFallback>{peer.user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-2 ring-white" />
              </div>
              <div>
                <p className="text-sm font-medium">{peer.user.name}</p>
                <p className="text-xs text-muted-foreground">{peer.user.email}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {peer.role}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
