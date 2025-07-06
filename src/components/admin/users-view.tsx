"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { collection, onSnapshot, query, type DocumentData } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "../ui/button"
import { ManualCreditDialog } from "./manual-credit-dialog"

export default function UsersView() {
  const [users, setUsers] = useState<DocumentData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<DocumentData | null>(null);
  const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "users"))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const usersData: DocumentData[] = []
      querySnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() })
      })
      setUsers(usersData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleCreditClick = (user: DocumentData) => {
    setSelectedUser(user);
    setIsCreditDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            View and manage all registered users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">User ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-9 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      {user.isAdmin ? (
                          <Badge>Admin</Badge>
                      ) : (
                          <Badge variant="secondary">User</Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-xs">{user.id}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="outline" size="sm" onClick={() => handleCreditClick(user)}>
                         Credit User
                       </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {selectedUser && (
        <ManualCreditDialog
          open={isCreditDialogOpen}
          onOpenChange={setIsCreditDialogOpen}
          userId={selectedUser.id}
          userEmail={selectedUser.email}
        />
      )}
    </>
  )
}