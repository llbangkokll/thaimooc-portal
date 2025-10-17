import { getNews, getImagePlaceholder } from "@/lib/data";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { NewsList } from "@/components/admin/news-list";

export default async function AdminNewsPage() {
  const news = await getNews();

  // Prepare news with image URLs
  const newsWithImages = news.map((item) => {
    const image = getImagePlaceholder(item.imageId);
    return {
      ...item,
      imageUrl: image?.url || null,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">News</h1>
          <p className="text-muted-foreground">Manage news articles</p>
        </div>
        <Button asChild>
          <Link href="/admin/news/new">
            <Plus className="h-4 w-4 mr-2" />
            Add News
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All News ({news.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <NewsList initialNews={newsWithImages} />
        </CardContent>
      </Card>
    </div>
  );
}
