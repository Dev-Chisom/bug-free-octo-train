'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useTranslation } from 'react-i18next'
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { Upload, Play, X, Loader2 } from 'lucide-react'
import * as z from 'zod'
import MediaGallery from '../home/media-gallery'
import MediaPreviewModal from '../home/media-preview-modal'

export type MediaFile = {
	id?: string
	url: string
	type: string
	name: string
	size?: number
	cover?: string
	duration?: number
	thumbnailUrl?: string
	tempId?: string
}

export type PostFormValues = {
	title: string
	content: string
	visibility: 'public' | 'subscribers' | 'pay-to-view'
	price?: number
	scheduledDate?: string
	mediaFiles: string[]
}

interface PostFormProps {
	initialValues?: {
		title: string
		content: string
		visibility: 'public' | 'subscribers' | 'pay-to-view'
		price: number
		mediaUrls: MediaFile[]
		scheduledDate?: string
	}
	loading?: boolean
	minScheduleDate?: string
	isEditMode?: boolean
	onSubmit: (data: any) => void
	onDraft: (data: any) => void
	onCancel: () => void
}

// Updated schema with conditional validation
const createPostFormSchema = (isScheduled: boolean) =>
	z.object({
		title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must be less than 200 characters'),
		content: z
			.string()
			.min(10, 'Content must be at least 10 characters')
			.max(5000, 'Content must be less than 5000 characters'),
		visibility: z.enum(['public', 'subscribers', 'pay-to-view']),
		price: z
			.number()
			.min(0.01, 'Price must be at least $0.01')
			.max(999.99, 'Price must be less than $999.99')
			.optional(),
		scheduledDate: isScheduled
			? z.string().min(1, 'Scheduled date is required when scheduling is enabled')
			: z.string().optional(),
		mediaFiles: z.array(z.string()).max(10, 'Maximum 10 media files allowed'),
	})

export function PostForm({
	initialValues = {
		title: '',
		content: '',
		visibility: 'public',
		price: 4.99,
		mediaUrls: [],
	},
	loading = false,
	minScheduleDate = '',
	isEditMode = false,
	onSubmit,
	onDraft,
	onCancel,
}: PostFormProps) {
	const { t } = useTranslation()
	const [uploadedMediaFiles, setUploadedMediaFiles] = useState<MediaFile[]>(initialValues.mediaUrls || [])
	const [isScheduled, setIsScheduled] = useState(!!initialValues.scheduledDate)
	const [showMediaGallery, setShowMediaGallery] = useState(false)
	const [mounted, setMounted] = useState(false)
	const [blobUrls, setBlobUrls] = useState<Set<string>>(new Set())

	// Media preview modal state
	const [previewModal, setPreviewModal] = useState({
		isOpen: false,
		items: [] as MediaFile[],
		currentIndex: 0,
	})

	// Prevent hydration issues
	useEffect(() => {
		setMounted(true)
	}, [])

	const form = useForm<PostFormValues>({
		defaultValues: {
			title: initialValues.title,
			content: initialValues.content,
			visibility: initialValues.visibility,
			price: initialValues.price,
			scheduledDate: initialValues.scheduledDate || '',
			mediaFiles: uploadedMediaFiles.map((m) => m.id).filter(Boolean) as string[],
		},
		validatorAdapter: zodValidator(),
		validators: {
			onChange: createPostFormSchema(isScheduled),
			onBlur: createPostFormSchema(isScheduled),
		},
		onSubmit: async ({ value }) => {
			const mediaFileIds = uploadedMediaFiles.filter((m) => m.id && !m.url.startsWith('blob:')).map((m) => m.id)

			const submitData = {
				title: value.title,
				body: value.content,
				visibility: value.visibility,
				...(value.visibility === 'pay-to-view' && { price: value.price }),
				mediaFiles: mediaFileIds,
				isScheduled,
				...(isScheduled && { scheduledDate: value.scheduledDate }),
			}

			onSubmit(submitData)
		},
	})

	useEffect(() => {
		setUploadedMediaFiles(initialValues.mediaUrls || [])
		setIsScheduled(!!initialValues.scheduledDate)
	}, [initialValues])

	// Update form validation when isScheduled changes
	useEffect(() => {
		// Update validators
		form.options.validators = {
			onChange: createPostFormSchema(isScheduled),
			onBlur: createPostFormSchema(isScheduled),
		}
		// Force revalidation of all fields
		form.validateAllFields('change')
	}, [isScheduled, form])

	// Trigger initial validation on mount
	useEffect(() => {
		if (mounted) {
			// Validate all fields on mount to set initial state
			form.validateAllFields('change')
		}
	}, [mounted, form])

	// Utility functions
	const isBlobUrl = (url: string): boolean => {
		return url.startsWith('blob:')
	}

	const cleanupBlobUrl = (url: string) => {
		if (isBlobUrl(url)) {
			URL.revokeObjectURL(url)
			setBlobUrls((prev) => {
				const newSet = new Set(prev)
				newSet.delete(url)
				return newSet
			})
		}
	}

	const cleanupAllBlobUrls = () => {
		blobUrls.forEach((url) => {
			URL.revokeObjectURL(url)
		})
		setBlobUrls(new Set())
	}

	const formatDuration = (seconds: number): string => {
		if (!seconds) return '0:00'
		const mins = Math.floor(seconds / 60)
		const secs = Math.floor(seconds % 60)
		return `${mins}:${secs.toString().padStart(2, '0')}`
	}

	const removeMediaFile = (index: number) => {
		const mediaToRemove = uploadedMediaFiles[index]

		// Clean up blob URL if it exists
		if (mediaToRemove && isBlobUrl(mediaToRemove.url || '')) {
			cleanupBlobUrl(mediaToRemove.url)
		}

		const newFiles = [...uploadedMediaFiles]
		newFiles.splice(index, 1)
		setUploadedMediaFiles(newFiles)

		// Update form field
		const mediaFileIds = newFiles.map((m) => m.id).filter(Boolean) as string[]
		form.setFieldValue('mediaFiles', mediaFileIds)
	}

	const addMediaFromGallery = (selectedMedia: MediaFile[]) => {
		// Filter out any items with blob URLs
		const validMedia = selectedMedia.filter((media) => !isBlobUrl(media.url || ''))
		setUploadedMediaFiles((prev) => [...prev, ...validMedia])

		// Update form field
		const allMedia = [...uploadedMediaFiles, ...validMedia]
		const mediaFileIds = allMedia.map((m) => m.id).filter(Boolean) as string[]
		form.setFieldValue('mediaFiles', mediaFileIds)
	}

	const handleUploadComplete = (results: any[]) => {
		// Filter out any results with blob URLs
		const validResults = results.filter((result) => !isBlobUrl(result.url || result.fileUrl || ''))

		// Find the temp objects that match the new uploads
		const tempObjects = uploadedMediaFiles.filter((m) => String(m.id).startsWith('temp-'))

		// Map new uploads
		const newMedia = validResults.map((result) => {
			const match = tempObjects.find((t) => t.name === result.name || t.tempId === result.tempId)

			return {
				id: result.mediaFileId || result._id,
				name: result.name || (match && match.name),
				type: result.type,
				url: result.fileUrl || result.url,
				thumbnailUrl: result.type === 'image' ? result.fileUrl || result.url : result.thumbnailUrl,
				coverUrl: result.type === 'video' ? result.coverUrl : undefined,
				...result,
			}
		})

		// Remove all temp objects from the array
		const filtered = uploadedMediaFiles.filter((m) => !String(m.id).startsWith('temp-'))

		// Only keep unique IDs and filter out blob URLs
		const merged = [...filtered, ...newMedia]
			.filter((item) => !isBlobUrl(item.url || ''))
			.filter((item, index, self) => index === self.findIndex((t) => t.id === item.id))

		setUploadedMediaFiles(merged)

		const ids = merged.map((r) => r.id).filter(Boolean) as string[]
		form.setFieldValue('mediaFiles', ids)
	}

	const openMediaPreview = (index: number) => {
		setPreviewModal({
			isOpen: true,
			items: [...uploadedMediaFiles],
			currentIndex: index,
		})
	}

	const closePreview = () => {
		setPreviewModal((prev) => ({ ...prev, isOpen: false }))
	}

	const handleCoverUpdate = (data: { index: number; cover: string | null }) => {
		if (data.index >= 0 && data.index < uploadedMediaFiles.length) {
			const newFiles = [...uploadedMediaFiles]
			newFiles[data.index].cover = data.cover || undefined
			setUploadedMediaFiles(newFiles)
		}
	}

	const setCoverForVideo = (media: MediaFile, index: number) => {
		openMediaPreview(index)
	}

	const getSubmitButtonText = () => {
		if (isEditMode) {
			return isScheduled ? t('updateSchedule') || 'Update Schedule' : t('postForm.updatePost') || 'Update Post'
		} else {
			return isScheduled ? t('schedulePost') || 'Schedule Post' : t('publishNow') || 'Publish Now'
		}
	}

	// State to track form validation
	const [formValidationState, setFormValidationState] = useState({
		isValid: false,
		lastCheck: 0,
	})

	// Improved validation function that properly checks form state
	const checkFormValidation = useCallback(() => {
		// Get current form values
		const values = form.state.values
		const fieldsMeta = form.state.fieldMeta

		// Check basic required fields
		const title = values.title?.trim() || ''
		const content = values.content?.trim() || ''

		const hasValidTitle = title.length >= 3 && title.length <= 200
		const hasValidContent = content.length >= 10 && content.length <= 5000

		// Check scheduled date if scheduling is enabled
		const hasValidSchedule = !isScheduled || (values.scheduledDate && values.scheduledDate.length > 0)

		// Check if any field has errors
		const hasFieldErrors = Object.values(fieldsMeta).some((meta) => meta.errors && meta.errors.length > 0)

		return hasValidTitle && hasValidContent && hasValidSchedule && !hasFieldErrors
	}, [form.state.values, form.state.fieldMeta, isScheduled])

	// Update validation state when dependencies change
	useEffect(() => {
		const isValid = checkFormValidation()
		setFormValidationState((prev) => ({
			isValid,
			lastCheck: Date.now(),
		}))
	}, [
		checkFormValidation,
		form.state.values.title,
		form.state.values.content,
		form.state.values.scheduledDate,
		isScheduled,
	])

	// Clean up blob URLs on unmount
	useEffect(() => {
		return () => {
			cleanupAllBlobUrls()
		}
	}, [])

	const FieldInfo = ({ field }: { field: any }) => (
		<>
			{field.state.meta.isTouched && field.state.meta.errors && field.state.meta.errors.length > 0 ? (
				<p className="text-sm text-red-500 mt-1">{field.state.meta.errors.join(', ')}</p>
			) : null}
		</>
	)

	// Show loading state until mounted
	if (!mounted) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
			</div>
		)
	}

	return (
		<>
			<form
				onSubmit={(e) => {
					e.preventDefault()
					e.stopPropagation()
					form.handleSubmit()
				}}
				className="space-y-6 p-6"
			>
				{/* Title */}
				<section>
					<form.Field
						name="title"
						children={(field) => (
							<div>
								<Label htmlFor={field.name}>
									{t('postTitle')} <span className="text-red-500 ml-1">*</span>
								</Label>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder={t('enterPostTitle')}
									className="mt-1"
								/>
								<FieldInfo field={field} />
							</div>
						)}
					/>
				</section>

				{/* Content */}
				<section>
					<form.Field
						name="content"
						children={(field) => (
							<div>
								<Label htmlFor={field.name}>
									{t('postContent')} <span className="text-red-500 ml-1">*</span>
								</Label>
								<Textarea
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									rows={5}
									placeholder={t('writePostContent')}
									className="mt-1"
								/>
								<FieldInfo field={field} />
							</div>
						)}
					/>
				</section>

				{/* Media Upload */}
				<section>
					<div>
						<div className="mt-2">
							{uploadedMediaFiles.length > 0 ? (
								<div>
									<div className="flex items-center justify-between mb-4">
										<Label>{t('mediaFiles') || 'Media Files'}</Label>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={() => setShowMediaGallery(true)}
											className="text-primary-600 dark:text-primary-400"
										>
											{t('addMore') || 'Add More'}
										</Button>
									</div>

									{/* Media Grid */}
									<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
										{uploadedMediaFiles.map((media, index) => (
											<div
												key={media.id || media.url || index}
												className="relative group overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 aspect-square cursor-pointer"
												onClick={() => openMediaPreview(index)}
											>
												{/* Image Display */}
												{media.type === 'image' && (media.thumbnailUrl || media.url) && (
													<img
														src={media.thumbnailUrl || media.url}
														alt={media.name || 'Image'}
														className="w-full h-full object-cover"
													/>
												)}

												{/* Video Display */}
												{media.type === 'video' && (
													<div className="relative w-full h-full">
														{media.cover && media.cover !== '' ? (
															<img
																src={media.cover}
																alt={media.name || 'Video cover'}
																className="w-full h-full object-cover"
															/>
														) : (
															<video src={media.url} className="w-full h-full object-cover" muted preload="metadata" />
														)}

														{/* Play Overlay */}
														<div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
															<div className="bg-white/90 dark:bg-gray-900/90 rounded-full p-3">
																<Play className="w-5 h-5 text-gray-900 dark:text-white" />
															</div>
														</div>

														{/* Duration Badge */}
														{media.duration && (
															<div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
																{formatDuration(media.duration)}
															</div>
														)}
													</div>
												)}

												{/* Remove Button */}
												<Button
													type="button"
													variant="destructive"
													size="sm"
													className="absolute top-2 right-2 w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
													onClick={(e) => {
														e.stopPropagation()
														removeMediaFile(index)
													}}
												>
													<X className="w-4 h-4" />
												</Button>

												{/* Set Cover Button for Videos */}
												{media.type === 'video' && (
													<Button
														type="button"
														variant="secondary"
														size="sm"
														className="absolute bottom-2 left-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
														onClick={(e) => {
															e.stopPropagation()
															setCoverForVideo(media, index)
														}}
													>
														{media.cover ? t('changeCover') || 'Change Cover' : t('setCover') || 'Set Cover'}
													</Button>
												)}
											</div>
										))}
									</div>

									<div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
										<span>
											{uploadedMediaFiles.length} {uploadedMediaFiles.length === 1 ? 'file' : 'files'} uploaded
										</span>
										{uploadedMediaFiles.length >= 10 && (
											<span className="text-amber-600 dark:text-amber-400 font-medium">Maximum files reached</span>
										)}
									</div>
								</div>
							) : (
								<div
									className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 px-6 py-10 text-center cursor-pointer hover:border-primary-400 transition-colors"
									onClick={() => setShowMediaGallery(true)}
								>
									<Upload className="mx-auto h-12 w-12 text-gray-400" />
									<div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
										<span className="font-medium text-primary-600 dark:text-primary-400">
											{t('content.uploadFiles')}
										</span>
									</div>
									<p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
										Images and videos up to 10 MB, max 10 files
									</p>
								</div>
							)}
						</div>
					</div>
				</section>

				{/* Post Settings */}
				<section className="pt-4 border-t border-gray-100 dark:border-gray-700">
					<h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
						{t('visibility') || 'Post Settings'}
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Visibility */}
						<div>
							<form.Field
								name="visibility"
								children={(field) => (
									<div>
										<Label>{t('visibility') || 'Visibility'}</Label>
										<div className="mt-2 space-y-3">
											<div className="flex items-start">
												<div className="flex items-center h-5">
													<input
														id="visibility-public"
														type="radio"
														value="public"
														checked={field.state.value === 'public'}
														onChange={(e) => field.handleChange(e.target.value as any)}
														className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
													/>
												</div>
												<div className="ml-3 text-sm">
													<Label htmlFor="visibility-public" className="font-medium text-gray-700 dark:text-gray-200">
														{t('public') || 'Public'}
													</Label>
													<p className="text-gray-500 dark:text-gray-400">
														{t('publicHint') || 'Visible to everyone, including non-subscribers'}
													</p>
												</div>
											</div>

											<div className="flex items-start">
												<div className="flex items-center h-5">
													<input
														id="visibility-subscribers"
														type="radio"
														value="subscribers"
														checked={field.state.value === 'subscribers'}
														onChange={(e) => field.handleChange(e.target.value as any)}
														className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
													/>
												</div>
												<div className="ml-3 text-sm">
													<Label
														htmlFor="visibility-subscribers"
														className="font-medium text-gray-700 dark:text-gray-200"
													>
														{t('subscribersOnly') || 'Subscribers Only'}
													</Label>
													<p className="text-gray-500 dark:text-gray-400">
														{t('subscribersOnlyHint') || 'Only visible to your paid subscribers'}
													</p>
												</div>
											</div>

											<div className="flex items-start">
												<div className="flex items-center h-5">
													<input
														id="visibility-pay-to-view"
														type="radio"
														value="pay-to-view"
														checked={field.state.value === 'pay-to-view'}
														onChange={(e) => field.handleChange(e.target.value as any)}
														className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
													/>
												</div>
												<div className="ml-3 text-sm">
													<Label
														htmlFor="visibility-pay-to-view"
														className="font-medium text-gray-700 dark:text-gray-200"
													>
														{t('payPerView') || 'Pay-to-view'}
													</Label>
													<p className="text-gray-500 dark:text-gray-400">
														{t('payPerViewHint') || 'Users must pay a one-time fee to access'}
													</p>
												</div>
											</div>
										</div>
										<FieldInfo field={field} />
									</div>
								)}
							/>
						</div>

						{/* Price field (conditional) */}
						<form.Field
							name="visibility"
							children={(visibilityField) => (
								<>
									{visibilityField.state.value === 'pay-to-view' && (
										<form.Field
											name="price"
											children={(field) => (
												<div>
													<Label htmlFor={field.name}>{t('price') || 'Price'}</Label>
													<Input
														id={field.name}
														name={field.name}
														type="number"
														step="0.01"
														min="0.01"
														max="999.99"
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(Number(e.target.value))}
														placeholder={t('pricePlaceholder') || 'Enter price'}
														className="mt-1"
													/>
													<FieldInfo field={field} />
												</div>
											)}
										/>
									)}
								</>
							)}
						/>

						{/* Schedule Settings */}
						<div className="md:col-span-2">
							<div className="flex items-start">
								<div className="flex items-center h-5">
									<Checkbox
										id="schedule"
										checked={isScheduled}
										onCheckedChange={setIsScheduled}
										className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
									/>
								</div>
								<div className="ml-3 text-sm">
									<Label htmlFor="schedule" className="font-medium text-gray-700 dark:text-gray-200">
										{t('scheduleForLater') || 'Schedule for later'}
									</Label>
									<p className="text-gray-500 dark:text-gray-400">
										{t('scheduleHint') || 'Set a future date and time to publish this post'}
									</p>
								</div>
							</div>

							{isScheduled && (
								<div className="mt-4">
									<form.Field
										name="scheduledDate"
										children={(field) => (
											<div>
												<Label htmlFor={field.name}>
													{t('publishDate') || 'Publish Date'} <span className="text-red-500 ml-1">*</span>
												</Label>
												<Input
													id={field.name}
													name={field.name}
													type="datetime-local"
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													min={minScheduleDate}
													className="mt-1"
												/>
												<FieldInfo field={field} />
											</div>
										)}
									/>
								</div>
							)}
						</div>
					</div>
				</section>

				{/* Form Actions */}
				<div className="bg-gray-50 dark:bg-gray-800 py-3 flex justify-end gap-3 px-6 -mx-6 -mb-6">
					<Button type="button" variant="outline" onClick={onCancel}>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={!formValidationState.isValid || loading}
						className={!formValidationState.isValid ? 'opacity-50 cursor-not-allowed' : ''}
					>
						{loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
						{getSubmitButtonText()}
					</Button>
				</div>
			</form>

			{/* Media Gallery Modal */}
			<MediaGallery
				isOpen={showMediaGallery}
				onClose={() => setShowMediaGallery(false)}
				onSelect={addMediaFromGallery}
				onUploadComplete={handleUploadComplete}
			/>

			{/* Media Preview Modal */}
			<MediaPreviewModal
				isOpen={previewModal.isOpen}
				mediaItems={previewModal.items}
				currentIndex={previewModal.currentIndex}
				enableVideoEdit={true}
				onClose={closePreview}
				onUpdateCurrentIndex={(index) => setPreviewModal((prev) => ({ ...prev, currentIndex: index }))}
				onUpdateCover={handleCoverUpdate}
			/>
		</>
	)
}
