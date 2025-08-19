"use client"

import { useState, useMemo, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useAuthStore } from "@/lib/auth/auth-store"
import PostCard from "@/components/home/post-card"
import UserSwiperList from "@/components/user-swiper-list"
import TipModal from "@/components/tip-modal"
import { useClientHydration } from "@/lib/hooks/use-client-hydration"
import { BuildLoading } from "@/components/ui/build-loading"
import type { Post, SuggestionUser } from "@/types/dashboard"

const mockPosts: Post[] = [
  {
    id: "1",
    creator: {
      id: "creator1",
      name: "John Doe",
      avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    },
    content: "This is a free post that everyone can see!",
    image: "https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    createdAt: new Date("2024-03-01"),
    likes: 42,
    isPremium: false,
    comments: [],
  },
  {
    id: "2",
    creator: {
      id: "creator2",
      name: "Jane Smith",
      avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    },
    content: "This is a premium post that requires subscription!",
    image: "https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    createdAt: new Date("2024-03-02"),
    likes: 156,
    isPremium: true,
    comments: [],
  },
]

const mockSuggestions: SuggestionUser[] = [
  {
    id: "fil-1",
    name: "Ana Mei",
    username: "anamei",
    avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
    banner: "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg",
  },
  {
    id: "fil-2",
    name: "Teacher Chloe",
    username: "teacherchloe",
    avatar: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg",
    banner: "https://images.pexels.com/photos/1595385/pexels-photo-1595385.jpeg",
  },
  {
    id: "fil-3",
    name: "Kissa",
    username: "kugsandkissahy",
    avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg",
    banner: "https://images.pexels.com/photos/3764160/pexels-photo-3764160.jpeg",
  },
  {
    id: "fil-4",
    name: "Bryce Adams",
    username: "bryceadams",
    avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    banner: "https://images.pexels.com/photos/2387866/pexels-photo-2387866.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  },
  {
    id: "fil-5",
    name: "LotusBombo",
    username: "lotusbombo",
    avatar: "https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    banner: "https://images.pexels.com/photos/1081685/pexels-photo-1081685.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  },
]

const mockExpiredSubscriptions: SuggestionUser[] = [
  {
    id: "exp-1",
    name: "Bryce Adams",
    username: "bryceadams",
    avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    banner: "https://images.pexels.com/photos/2387866/pexels-photo-2387866.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    expired: true,
  },
  {
    id: "exp-2",
    name: "LotusBombo",
    username: "lotusbombo",
    avatar: "https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    banner: "https://images.pexels.com/photos/1081685/pexels-photo-1081685.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    expired: true,
  },
]

export default function HomePage() {
  const { t } = useTranslation()
  const { getSubscriptions } = useAuthStore()
  const isClient = useClientHydration()

  const [posts, setPosts] = useState<Post[]>(mockPosts)
  const [suggestions, setSuggestions] = useState<SuggestionUser[]>(mockSuggestions)
  const [expiredSubscriptions, setExpiredSubscriptions] = useState<SuggestionUser[]>(mockExpiredSubscriptions)
  const [suggestionSearch, setSuggestionSearch] = useState("")
  const [showingTipModal, setShowingTipModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  // Get user subscriptions - this must be called before any conditional returns
  const userSubscriptions = getSubscriptions()

  // Memoized filtered suggestions - this must be called before any conditional returns
  const filteredSuggestions = useMemo(() => {
    if (!suggestionSearch) {
      return suggestions.filter((user) => !expiredSubscriptions.some((expired) => expired.id === user.id))
    }
    return suggestions.filter(
      (user) =>
        (user.name.toLowerCase().includes(suggestionSearch.toLowerCase()) ||
          user.username.toLowerCase().includes(suggestionSearch.toLowerCase())) &&
        !expiredSubscriptions.some((expired) => expired.id === user.id),
    )
  }, [suggestions, expiredSubscriptions, suggestionSearch])

  // Helper functions - these don't need to be hooks, just regular functions
  const isSubscribedToCreator = (creatorId: string): boolean => {
    return userSubscriptions.includes(creatorId)
  }

  const subscribeToCreator = async (creatorId: string): Promise<void> => {
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const creator =
        suggestions.find((s) => s.id === creatorId) || expiredSubscriptions.find((s) => s.id === creatorId)

      toast.success(t("notifications.subscription.success", { name: creator?.name || "Creator" }))
    } catch (error) {
      toast.error(t("notifications.subscription.error"))
    }
  }

  const showTipModal = (post: Post): void => {
    setSelectedPost(post)
    setShowingTipModal(true)
  }

  const sendTip = async (amount: number): Promise<void> => {
    if (!selectedPost || amount < 100) {
      return
    }

    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success(t("notifications.tip.success", { name: selectedPost.creator.name }))
    } catch (error) {
      toast.error(t("notifications.tip.error"))
      throw error
    }
  }

  useEffect(() => {
    // TODO: Fetch posts from API
    const fetchPosts = async () => {
      // setPosts(await api.getPosts())
    }

    fetchPosts()
  }, [])

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return <BuildLoading />
  }

  return (
    <div className="max-w-7xl mx-auto px-2 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-3">
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isSubscribed={isSubscribedToCreator(post.creator.id)}
                onSubscribe={subscribeToCreator}
                onTip={showTipModal}
              />
            ))}
          </div>
        </div>

        {/* Suggestions Panel */}
        <div className="hidden lg:block col-span-2">
          <div className="sticky top-4 z-10 h-[calc(100vh-2rem)] overflow-y-auto pb-4">
            <div className="bg-card rounded-xl shadow-md border border-border p-4 w-full max-w-xl mx-auto">
              {/* Search Bar */}
              <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder={t("home.searchUsersOrPosts")}
                  value={suggestionSearch}
                  onChange={(e) => setSuggestionSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <UserSwiperList users={filteredSuggestions} title={t("home.suggestions")} usersPerSlide={3} />

              <div className="mt-8">
                <UserSwiperList
                  users={expiredSubscriptions}
                  title={t("subscriptions.expiredSubscriptions")}
                  usersPerSlide={3}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tip Modal */}
      <TipModal
        isOpen={showingTipModal}
        onClose={() => setShowingTipModal(false)}
        post={selectedPost}
        onSendTip={sendTip}
      />
    </div>
  )
}
