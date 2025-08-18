import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, History, LogOut } from 'lucide-react';

interface Props {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: Props) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-full max-w-md text-center relative">
        <Button
          onClick={onLogout}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
          title="Đăng xuất"
        >
          <LogOut className="h-4 w-4" />
        </Button>
        <CardHeader>
          <CardTitle className="text-2xl">Chọn hoạt động</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => navigate('/game')}
            className="w-full flex items-center gap-2 text-lg py-6"
            size="lg"
          >
            <Play className="h-5 w-5" />
            Chơi game
          </Button>
          <Button
            onClick={() => navigate('/history')}
            variant="outline"
            className="w-full flex items-center gap-2 text-lg py-6"
            size="lg"
          >
            <History className="h-5 w-5" />
            Xem lịch sử
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
