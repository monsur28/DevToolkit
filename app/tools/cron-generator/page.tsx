"use client"

import { useState, useEffect } from "react"
import { ToolLayout } from "@/components/tool-layout"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Copy, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface CronParts {
  minute: string
  hour: string
  dayOfMonth: string
  month: string
  dayOfWeek: string
}

export default function CronGeneratorPage() {
  const [cronParts, setCronParts] = useState<CronParts>({
    minute: "*",
    hour: "*",
    dayOfMonth: "*",
    month: "*",
    dayOfWeek: "*",
  })
  const [cronExpression, setCronExpression] = useState("* * * * *")
  const [description, setDescription] = useState("")
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [isMounted, setIsMounted] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const daysOfWeek = [
    { value: "0", label: "Sunday" },
    { value: "1", label: "Monday" },
    { value: "2", label: "Tuesday" },
    { value: "3", label: "Wednesday" },
    { value: "4", label: "Thursday" },
    { value: "5", label: "Friday" },
    { value: "6", label: "Saturday" },
  ]

  const presets = [
    { name: "Every minute", cron: "* * * * *" },
    { name: "Every hour", cron: "0 * * * *" },
    { name: "Every day at midnight", cron: "0 0 * * *" },
    { name: "Every day at noon", cron: "0 12 * * *" },
    { name: "Every Monday at 9 AM", cron: "0 9 * * 1" },
    { name: "Every weekday at 9 AM", cron: "0 9 * * 1-5" },
    { name: "Every month on the 1st at midnight", cron: "0 0 1 * *" },
    { name: "Every Sunday at 2 AM", cron: "0 2 * * 0" },
  ]

  useEffect(() => {
    if (isMounted) {
      const expression = `${cronParts.minute} ${cronParts.hour} ${cronParts.dayOfMonth} ${cronParts.month} ${cronParts.dayOfWeek}`
      setCronExpression(expression)
      setDescription(generateDescription(cronParts))
    }
  }, [cronParts, isMounted])

  const generateDescription = (parts: CronParts): string => {
    let desc = "Run "

    // Minute
    if (parts.minute === "*") {
      desc += "every minute"
    } else if (parts.minute.includes("/")) {
      const interval = parts.minute.split("/")[1]
      desc += `every ${interval} minutes`
    } else {
      desc += `at minute ${parts.minute}`
    }

    // Hour
    if (parts.hour !== "*") {
      if (parts.hour.includes("/")) {
        const interval = parts.hour.split("/")[1]
        desc += ` of every ${interval} hours`
      } else {
        const hour = Number.parseInt(parts.hour)
        const ampm = hour >= 12 ? "PM" : "AM"
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
        desc += ` at ${displayHour}:00 ${ampm}`
      }
    }

    // Day of month
    if (parts.dayOfMonth !== "*") {
      desc += ` on day ${parts.dayOfMonth} of the month`
    }

    // Month
    if (parts.month !== "*") {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      const monthNum = Number.parseInt(parts.month) - 1
      desc += ` in ${months[monthNum]}`
    }

    // Day of week
    if (parts.dayOfWeek !== "*") {
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
      if (parts.dayOfWeek.includes("-")) {
        desc += " on weekdays"
      } else if (parts.dayOfWeek.includes(",")) {
        const dayNums = parts.dayOfWeek.split(",").map((d) => Number.parseInt(d))
        const dayNames = dayNums.map((d) => days[d]).join(", ")
        desc += ` on ${dayNames}`
      } else {
        const dayNum = Number.parseInt(parts.dayOfWeek)
        desc += ` on ${days[dayNum]}`
      }
    }

    return desc
  }

  const updateCronPart = (part: keyof CronParts, value: string) => {
    setCronParts((prev) => ({ ...prev, [part]: value }))
  }

  const handleDayToggle = (day: string, checked: boolean) => {
    let newSelectedDays: string[]
    if (checked) {
      newSelectedDays = [...selectedDays, day].sort()
    } else {
      newSelectedDays = selectedDays.filter((d) => d !== day)
    }
    setSelectedDays(newSelectedDays)

    if (newSelectedDays.length === 0) {
      updateCronPart("dayOfWeek", "*")
    } else {
      updateCronPart("dayOfWeek", newSelectedDays.join(","))
    }
  }

  const loadPreset = (cronString: string) => {
    const parts = cronString.split(" ")
    setCronParts({
      minute: parts[0],
      hour: parts[1],
      dayOfMonth: parts[2],
      month: parts[3],
      dayOfWeek: parts[4],
    })

    // Update selected days
    if (parts[4] !== "*") {
      if (parts[4].includes(",")) {
        setSelectedDays(parts[4].split(","))
      } else if (parts[4].includes("-")) {
        const [start, end] = parts[4].split("-").map(Number)
        const days = []
        for (let i = start; i <= end; i++) {
          days.push(i.toString())
        }
        setSelectedDays(days)
      } else {
        setSelectedDays([parts[4]])
      }
    } else {
      setSelectedDays([])
    }
  }

  const copyToClipboard = async () => {
    if (!isMounted || typeof window === "undefined") return

    try {
      await navigator.clipboard.writeText(cronExpression)
      toast({
        title: "Copied!",
        description: "Cron expression copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const reset = () => {
    setCronParts({
      minute: "*",
      hour: "*",
      dayOfMonth: "*",
      month: "*",
      dayOfWeek: "*",
    })
    setSelectedDays([])
  }

  // Show loading state until mounted
  if (!isMounted) {
    return (
      <ToolLayout
        title="Cron Expression Generator"
        description="Build cron expressions with UI and natural language output"
        icon={<Calendar className="h-8 w-8 text-amber-500" />}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </ToolLayout>
    )
  }

  return (
    <ToolLayout
      title="Cron Expression Generator"
      description="Build cron expressions with UI and natural language output"
      icon={<Calendar className="h-8 w-8 text-amber-500" />}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Generated Cron Expression</CardTitle>
            <CardDescription>Your cron expression and human-readable description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-md">
              <code className="text-lg font-mono">{cronExpression}</code>
              <Button onClick={copyToClipboard} size="sm" variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
            <p className="text-sm text-muted-foreground bg-background p-3 rounded-md border">{description}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Build Expression</CardTitle>
              <CardDescription>Configure each part of the cron expression</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Minute (0-59)</label>
                    <Select value={cronParts.minute} onValueChange={(value) => updateCronPart("minute", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="*">Every minute (*)</SelectItem>
                        <SelectItem value="0">0</SelectItem>
                        <SelectItem value="15">15</SelectItem>
                        <SelectItem value="30">30</SelectItem>
                        <SelectItem value="45">45</SelectItem>
                        <SelectItem value="*/5">Every 5 minutes (*/5)</SelectItem>
                        <SelectItem value="*/10">Every 10 minutes (*/10)</SelectItem>
                        <SelectItem value="*/15">Every 15 minutes (*/15)</SelectItem>
                        <SelectItem value="*/30">Every 30 minutes (*/30)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Hour (0-23)</label>
                    <Select value={cronParts.hour} onValueChange={(value) => updateCronPart("hour", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="*">Every hour (*)</SelectItem>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i.toString().padStart(2, "0")}:00
                          </SelectItem>
                        ))}
                        <SelectItem value="*/2">Every 2 hours (*/2)</SelectItem>
                        <SelectItem value="*/4">Every 4 hours (*/4)</SelectItem>
                        <SelectItem value="*/6">Every 6 hours (*/6)</SelectItem>
                        <SelectItem value="*/12">Every 12 hours (*/12)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Day of Month (1-31)</label>
                    <Select value={cronParts.dayOfMonth} onValueChange={(value) => updateCronPart("dayOfMonth", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="*">Every day (*)</SelectItem>
                        {Array.from({ length: 31 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1}
                          </SelectItem>
                        ))}
                        <SelectItem value="1">1st of month</SelectItem>
                        <SelectItem value="15">15th of month</SelectItem>
                        <SelectItem value="L">Last day of month (L)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Month (1-12)</label>
                    <Select value={cronParts.month} onValueChange={(value) => updateCronPart("month", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="*">Every month (*)</SelectItem>
                        <SelectItem value="1">January</SelectItem>
                        <SelectItem value="2">February</SelectItem>
                        <SelectItem value="3">March</SelectItem>
                        <SelectItem value="4">April</SelectItem>
                        <SelectItem value="5">May</SelectItem>
                        <SelectItem value="6">June</SelectItem>
                        <SelectItem value="7">July</SelectItem>
                        <SelectItem value="8">August</SelectItem>
                        <SelectItem value="9">September</SelectItem>
                        <SelectItem value="10">October</SelectItem>
                        <SelectItem value="11">November</SelectItem>
                        <SelectItem value="12">December</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Days of Week</label>
                  <div className="grid grid-cols-2 gap-2">
                    {daysOfWeek.map((day) => (
                      <div key={day.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={day.value}
                          checked={selectedDays.includes(day.value)}
                          onCheckedChange={(checked) => handleDayToggle(day.value, checked as boolean)}
                        />
                        <label htmlFor={day.value} className="text-sm">
                          {day.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      onClick={() => {
                        setSelectedDays(["1", "2", "3", "4", "5"])
                        updateCronPart("dayOfWeek", "1-5")
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Weekdays
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedDays(["0", "6"])
                        updateCronPart("dayOfWeek", "0,6")
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Weekends
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedDays([])
                        updateCronPart("dayOfWeek", "*")
                      }}
                      variant="outline"
                      size="sm"
                    >
                      All Days
                    </Button>
                  </div>
                </div>

                <Button onClick={reset} variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Common Presets</CardTitle>
              <CardDescription>Quick start with common cron expressions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {presets.map((preset, index) => (
                  <Button
                    key={index}
                    onClick={() => loadPreset(preset.cron)}
                    variant="outline"
                    className="w-full justify-between h-auto p-3"
                  >
                    <div className="text-left">
                      <div className="font-medium">{preset.name}</div>
                      <code className="text-xs text-muted-foreground">{preset.cron}</code>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cron Format Reference</CardTitle>
            <CardDescription>Understanding cron expression format</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-4 text-center text-sm">
                <div className="p-2 bg-muted rounded">
                  <div className="font-medium">Minute</div>
                  <div className="text-xs text-muted-foreground">0-59</div>
                </div>
                <div className="p-2 bg-muted rounded">
                  <div className="font-medium">Hour</div>
                  <div className="text-xs text-muted-foreground">0-23</div>
                </div>
                <div className="p-2 bg-muted rounded">
                  <div className="font-medium">Day of Month</div>
                  <div className="text-xs text-muted-foreground">1-31</div>
                </div>
                <div className="p-2 bg-muted rounded">
                  <div className="font-medium">Month</div>
                  <div className="text-xs text-muted-foreground">1-12</div>
                </div>
                <div className="p-2 bg-muted rounded">
                  <div className="font-medium">Day of Week</div>
                  <div className="text-xs text-muted-foreground">0-6 (Sun-Sat)</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Special Characters:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>
                      <code>*</code> - Any value
                    </li>
                    <li>
                      <code>,</code> - Value list separator
                    </li>
                    <li>
                      <code>-</code> - Range of values
                    </li>
                    <li>
                      <code>/</code> - Step values
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Examples:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>
                      <code>*/15</code> - Every 15 units
                    </li>
                    <li>
                      <code>1-5</code> - Monday to Friday
                    </li>
                    <li>
                      <code>1,3,5</code> - Monday, Wednesday, Friday
                    </li>
                    <li>
                      <code>0 9 * * 1-5</code> - 9 AM on weekdays
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  )
}
