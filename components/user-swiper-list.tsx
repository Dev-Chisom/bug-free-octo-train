"use client"

import { useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination } from "swiper/modules"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { SuggestionUser } from "@/types/dashboard"

// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

interface UserSwiperListProps {
  users: SuggestionUser[]
  title: string
  usersPerSlide?: number
}

export default function UserSwiperList({ users, title, usersPerSlide = 3 }: UserSwiperListProps) {
  const [swiper, setSwiper] = useState<any>(null)
  const [isBeginning, setIsBeginning] = useState(true)
  const [isEnd, setIsEnd] = useState(false)

  // Chunk users into groups for each slide
  const chunkArray = (array: SuggestionUser[], size: number) => {
    const result = []
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size))
    }
    return result
  }

  const chunkedUsers = chunkArray(users, usersPerSlide)
  const showNavigation = users.length > usersPerSlide

  if (!users || users.length === 0) {
    return (
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">{title}</h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="text-sm">No users to show</p>
        </div>
      </div>
    )
  }

  const handleSwiper = (swiperInstance: any) => {
    setSwiper(swiperInstance)
    setIsBeginning(swiperInstance.isBeginning)
    setIsEnd(swiperInstance.isEnd)

    swiperInstance.on('slideChange', () => {
      setIsBeginning(swiperInstance.isBeginning)
      setIsEnd(swiperInstance.isEnd)
    })
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{title}</h3>
        {showNavigation && (
          <div className="flex items-center gap-2">
            <button
              disabled={isBeginning}
              className={`p-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition ${
                isBeginning ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={() => swiper?.slidePrev()}
            >
              <ChevronLeft className="h-5 w-5 text-gray-500 dark:text-gray-300" />
            </button>
            <button
              disabled={isEnd}
              className={`p-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition ${
                isEnd ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={() => swiper?.slideNext()}
            >
              <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-300" />
            </button>
          </div>
        )}
      </div>

      <Swiper
        modules={[Navigation, Pagination]}
        slidesPerView={1}
        spaceBetween={16}
        onSwiper={handleSwiper}
        pagination={{ 
          clickable: true,
          bulletClass: 'swiper-pagination-bullet',
          bulletActiveClass: 'swiper-pagination-bullet-active'
        }}
        className="user-swiper"
      >
        {chunkedUsers.map((chunk, index) => (
          <SwiperSlide key={index}>
            <div className="space-y-4">
              {chunk.map((user) => (
                <div 
                  key={user.id} 
                  className="relative flex flex-col justify-end rounded-xl overflow-hidden aspect-[2/1] w-full group cursor-pointer transition"
                >
                  <img
                    src={user.banner || user.avatar}
                    alt={user.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 via-black/40 to-transparent group-hover:from-black/80 group-hover:via-black/60 transition"></div>

                  {user.expired && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      Expired
                    </div>
                  )}

                  <div className="relative z-10 flex p-4 items-end">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-900 object-cover"
                    />
                    <div className="ml-4 mb-1">
                      <div className="font-bold text-lg text-white">{user.name}</div>
                      <div className="text-xs text-gray-200">@{user.username}</div>
                      {user.expired && (
                        <span className="text-xs text-red-500 dark:text-red-400 ml-2">Expired</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom styles for pagination */}
      <style jsx global>{`
        .user-swiper .swiper-pagination {
          position: static;
          margin-top: 8px;
        }
        
        .user-swiper .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: #6b7280;
          opacity: 1;
          margin: 0 4px;
        }
        
        .user-swiper .swiper-pagination-bullet-active {
          background: #8b5cf6;
        }
      `}</style>
    </div>
  )
}