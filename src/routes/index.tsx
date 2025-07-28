import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Clock, User, Calendar } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: ClassScheduler,
})

interface ClassSection {
  id: string
  courseCode: string
  sectionNumber: string
  courseName: string
  instructor: string
  days: string[]
  startTime: string
  endTime: string
  location: string
  credits: number
}

interface ClassGroup {
  id: string
  name: string
  sections: ClassSection[]
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const DAY_ABBREVIATIONS: { [key: string]: string } = {
  Monday: "M",
  Tuesday: "T",
  Wednesday: "W",
  Thursday: "R",
  Friday: "F",
  Saturday: "S",
  Sunday: "U",
}

export default function ClassScheduler() {
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([
    {
      id: "1",
      name: "Class 1",
      sections: [],
    },
  ])

  const [selectedSections, setSelectedSections] = useState<{ [groupId: string]: string }>({})

  const addClassGroup = () => {
    const newGroup: ClassGroup = {
      id: Date.now().toString(),
      name: `Class ${classGroups.length + 1}`,
      sections: [],
    }
    setClassGroups([...classGroups, newGroup])
  }

  const removeClassGroup = (groupId: string) => {
    if (classGroups.length > 1) {
      setClassGroups(classGroups.filter((group) => group.id !== groupId))
      const newSelected = { ...selectedSections }
      delete newSelected[groupId]
      setSelectedSections(newSelected)
    }
  }

  const addSectionToGroup = (groupId: string, section: ClassSection) => {
    setClassGroups(
      classGroups.map((group) => (group.id === groupId ? { ...group, sections: [...group.sections, section] } : group)),
    )
  }

  const removeSectionFromGroup = (groupId: string, sectionId: string) => {
    setClassGroups(
      classGroups.map((group) =>
        group.id === groupId
          ? { ...group, sections: group.sections.filter((section) => section.id !== sectionId) }
          : group,
      ),
    )

    if (selectedSections[groupId] === sectionId) {
      const newSelected = { ...selectedSections }
      delete newSelected[groupId]
      setSelectedSections(newSelected)
    }
  }

  const selectSection = (groupId: string, sectionId: string) => {
    setSelectedSections({
      ...selectedSections,
      [groupId]: selectedSections[groupId] === sectionId ? "" : sectionId,
    })
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  const formatDays = (days: string[]) => {
    return days.map((day) => DAY_ABBREVIATIONS[day]).join("")
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Class Scheduler</h1>
          <p className="text-muted-foreground">
            Organize your class options into groups. Each column represents mutually exclusive classes or sections.
          </p>
        </div>

        <div className="mb-6">
          <Button onClick={addClassGroup} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Class Group
          </Button>
        </div>

        <div className="space-y-6">
          {classGroups.map((group) => (
            <ClassGroupColumn
              key={group.id}
              group={group}
              selectedSection={selectedSections[group.id]}
              onRemoveGroup={() => removeClassGroup(group.id)}
              onAddSection={(section) => addSectionToGroup(group.id, section)}
              onRemoveSection={(sectionId) => removeSectionFromGroup(group.id, sectionId)}
              onSelectSection={(sectionId) => selectSection(group.id, sectionId)}
              canRemove={classGroups.length > 1}
              formatTime={formatTime}
              formatDays={formatDays}
            />
          ))}
        </div>

        {Object.keys(selectedSections).length > 0 && (
          <div className="mt-8 p-6 bg-card rounded-lg shadow-sm border-border">
            <h2 className="text-xl font-semibold mb-4 text-card-foreground">Selected Schedule</h2>
            <div className="space-y-3">
              {Object.entries(selectedSections).map(([groupId, sectionId]) => {
                const group = classGroups.find((g) => g.id === groupId)
                const section = group?.sections.find((s) => s.id === sectionId)
                if (!section) return null

                return (
                  <div
                    key={`${groupId}-${sectionId}`}
                    className="flex items-center justify-between p-3 bg-accent rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-accent-foreground">
                        {section.courseCode} - {section.courseName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Section {section.sectionNumber} • {formatDays(section.days)} {formatTime(section.startTime)}-
                        {formatTime(section.endTime)}
                      </div>
                    </div>
                    <Badge variant="secondary">{section.credits} credits</Badge>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface ClassGroupColumnProps {
  group: ClassGroup
  selectedSection?: string
  onRemoveGroup: () => void
  onAddSection: (section: ClassSection) => void
  onRemoveSection: (sectionId: string) => void
  onSelectSection: (sectionId: string) => void
  canRemove: boolean
  formatTime: (time: string) => string
  formatDays: (days: string[]) => string
}

function ClassGroupColumn({
  group,
  selectedSection,
  onRemoveGroup,
  onAddSection,
  onRemoveSection,
  onSelectSection,
  canRemove,
  formatTime,
  formatDays,
}: ClassGroupColumnProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{group.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {group.sections.length} section{group.sections.length !== 1 ? "s" : ""} available
              {selectedSection && " • 1 selected"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AddSectionDialog onAddSection={onAddSection} />
            {canRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemoveGroup}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {group.sections.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium mb-1">No sections added yet</p>
            <p className="text-sm">Add your first section to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {group.sections.map((section) => (
              <SectionCard
                key={section.id}
                section={section}
                isSelected={selectedSection === section.id}
                onSelect={() => onSelectSection(section.id)}
                onRemove={() => onRemoveSection(section.id)}
                formatTime={formatTime}
                formatDays={formatDays}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface SectionCardProps {
  section: ClassSection
  isSelected: boolean
  onSelect: () => void
  onRemove: () => void
  formatTime: (time: string) => string
  formatDays: (days: string[]) => string
}

function SectionCard({ section, isSelected, onSelect, onRemove, formatTime, formatDays }: SectionCardProps) {
  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-all h-full flex flex-col ${
        isSelected
          ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
          : "border-border hover:border-border/80 hover:shadow-sm bg-card"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-card-foreground truncate">{section.courseCode}</div>
          <div className="text-xs text-muted-foreground mb-1">Section {section.sectionNumber}</div>
          <div className="text-sm text-card-foreground line-clamp-2 mb-2">{section.courseName}</div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 p-1 ml-2 flex-shrink-0"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>

      <div className="space-y-2 text-xs text-muted-foreground flex-1">
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">
            {formatDays(section.days)} {formatTime(section.startTime)}-{formatTime(section.endTime)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{section.instructor}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="truncate flex-1">{section.location}</span>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-border flex justify-between items-center">
        <Badge variant="outline" className="text-xs">
          {section.credits} credits
        </Badge>
        {isSelected && (
          <Badge variant="default" className="text-xs bg-primary text-primary-foreground">
            Selected
          </Badge>
        )}
      </div>
    </div>
  )
}

function AddSectionDialog({ onAddSection }: { onAddSection: (section: ClassSection) => void }) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    courseCode: "",
    sectionNumber: "",
    courseName: "",
    instructor: "",
    days: [] as string[],
    startTime: "",
    endTime: "",
    location: "",
    credits: 3,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !formData.courseCode ||
      !formData.sectionNumber ||
      !formData.courseName ||
      !formData.instructor ||
      formData.days.length === 0 ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.location
    ) {
      return
    }

    const newSection: ClassSection = {
      id: Date.now().toString(),
      ...formData,
    }

    onAddSection(newSection)
    setFormData({
      courseCode: "",
      sectionNumber: "",
      courseName: "",
      instructor: "",
      days: [],
      startTime: "",
      endTime: "",
      location: "",
      credits: 3,
    })
    setOpen(false)
  }

  const toggleDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter((d) => d !== day) : [...prev.days, day],
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-transparent">
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Class Section</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="courseCode">Course Code</Label>
              <Input
                id="courseCode"
                placeholder="MTH 103"
                value={formData.courseCode}
                onChange={(e) => setFormData((prev) => ({ ...prev, courseCode: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="sectionNumber">Section</Label>
              <Input
                id="sectionNumber"
                placeholder="001"
                value={formData.sectionNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, sectionNumber: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="courseName">Course Name</Label>
            <Input
              id="courseName"
              placeholder="College Algebra"
              value={formData.courseName}
              onChange={(e) => setFormData((prev) => ({ ...prev, courseName: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="instructor">Instructor</Label>
            <Input
              id="instructor"
              placeholder="Dr. Smith"
              value={formData.instructor}
              onChange={(e) => setFormData((prev) => ({ ...prev, instructor: e.target.value }))}
            />
          </div>

          <div>
            <Label>Days of Week</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {DAYS_OF_WEEK.map((day) => (
                <Button
                  key={day}
                  type="button"
                  variant={formData.days.includes(day) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleDay(day)}
                >
                  {DAY_ABBREVIATIONS[day]}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Room 101"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="credits">Credits</Label>
              <Select
                value={formData.credits.toString()}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, credits: Number.parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Section
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
