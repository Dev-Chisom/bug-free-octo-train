"use client"

import { useState, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Search, ChevronDown, ImageOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import MediaGridItem from "./media-grid-item"
import { Skeleton } from "@/components/ui/skeleton"

interface MediaFile {
  id: string
  name: string
  type: "image" | "video"
  url: string
  thumbnailUrl?: string
  size?: number
  duration?: number
}

interface MediaLibraryTabProps {
  loading: boolean
  mediaFiles: MediaFile[]
  selectedIds: string[]
  currentPage: number
  perPage: number
  totalPages: number
  totalItems: number
  activeMediaTab: string
  onUpdateActiveMediaTab: (tab: string) => void
  onUpdateCurrentPage: (page: number) => void
  onUpdatePerPage: (perPage: number) => void
  onToggleSelect: (media: MediaFile) => void
  onSearch: (query: string) => void
}

export default function MediaLibraryTab({
  loading,
  mediaFiles,
  selectedIds,
  currentPage,
  perPage,
  totalPages,
  totalItems,
  activeMediaTab,
  onUpdateActiveMediaTab,
  onUpdateCurrentPage,
  onUpdatePerPage,
  onToggleSelect,
  onSearch,
}: MediaLibraryTabProps) {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch(value)
  }

  const filteredMedia = useMemo(() => {
    if (activeMediaTab === "images") {
      return mediaFiles.filter((file) => file.type === "image")
    } else if (activeMediaTab === "videos") {
      return mediaFiles.filter((file) => file.type === "video")
    }
    return mediaFiles
  }, [mediaFiles, activeMediaTab])

  const SkeletonGrid = () => (
    <div className="grid md:grid-cols-3 grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, index) => (
        <div key={index} className="relative rounded-xl overflow-hidden aspect-square">
          <Skeleton className="rounded-xl w-full h-full" />

          {/* Add video play icon overlay to some items */}
          {index % 3 === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-gray-800/50 rounded-full p-3">
                <div className="w-6 h-6 bg-white/80 rounded-full" />
              </div>
            </div>
          )}

          {/* Add selection indicator to some items */}
          {index % 5 === 0 && (
            <div className="absolute top-3 left-3 bg-primary-500 text-white rounded-full p-1">
              <div className="w-4 h-4 bg-white rounded-full" />
            </div>
          )}

          {/* Add info overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
            <Skeleton className="h-3 mb-1" />
            <Skeleton className="h-2 w-3/5" />
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="h-full flex flex-col">
      {/* Search and Filter Bar */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between space-x-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search your media..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl focus:ring-1 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-700 transition-all"
            />
          </div>

          {/* Media Type Dropdown */}
          <div className="relative">
            <Select value={activeMediaTab} onValueChange={onUpdateActiveMediaTab}>
              <SelectTrigger className="appearance-none bg-gray-100 dark:bg-gray-800 border-0 rounded-xl px-4 py-2 pr-10 focus:ring-1 focus:ring-primary-500 cursor-pointer w-40">
                <SelectValue />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="images">📸 Images</SelectItem>
                <SelectItem value="videos">🎥 Videos</SelectItem>
                <SelectItem value="all">📁 All Media</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Media Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <SkeletonGrid />
        ) : filteredMedia.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <ImageOff className="w-16 h-16 mb-4 opacity-50" />
            <h3 className="text-base font-medium mb-2">No media found</h3>
            <p className="text-sm text-center">Try adjusting your search or upload some content</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredMedia.map((media) => (
              <MediaGridItem
                key={media.id}
                media={media}
                selected={selectedIds.includes(media.id)}
                onToggleSelect={() => onToggleSelect(media)}
              />
            ))}
          </div>
        )}

        {/* Pagination would go here if needed */}
        {totalPages > 1 && <div className="mt-8">{/* Pagination component would be implemented here */}</div>}
      </div>
    </div>
  )
}
