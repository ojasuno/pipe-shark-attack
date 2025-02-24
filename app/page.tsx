"use client"

import dynamic from "next/dynamic"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search } from "lucide-react"

const Map = dynamic(() => import("@/components/map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-muted animate-pulse rounded-lg flex items-center justify-center">
      Loading map...
    </div>
  ),
})

type BannedIP = {
  ip: string
  country: string
  countryCode: string
  city: string
}

export default function Page() {
  const [bannedIPs, setBannedIPs] = useState<BannedIP[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/banned_ips_locations.csv")
        const data = await response.text()
        const lines = data.split("\n")
        const parsedIPs: BannedIP[] = []

        // Skip header row and parse CSV
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim()
          if (line) {
            const [ip, countryCode, country] = line.split(",").map((item) => item.trim())
            if (ip && countryCode && country) {
              parsedIPs.push({
                ip,
                country,
                countryCode,
                city: "", // City data is not being used in this version
              })
            }
          }
        }

        setBannedIPs(parsedIPs)
      } catch (error) {
        console.error("Error loading IPs:", error)
      }
    }

    fetchData()
  }, [])

  const filteredIPs = bannedIPs.filter(
    (ip) =>
      ip.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ip.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ip.countryCode.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Banned IP Locations Map</CardTitle>
        </CardHeader>
        <CardContent>
          <Map locations={bannedIPs} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Banned IPs List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by IP, country, or country code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Country Code</TableHead>
                  <TableHead>Country</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIPs.map((ip, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono">{ip.ip}</TableCell>
                    <TableCell>{ip.countryCode}</TableCell>
                    <TableCell>{ip.country}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
