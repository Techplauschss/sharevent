import { auth } from "@/auth";
import { PrismaClient } from "@/generated/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { EventDetails } from "@/components/EventDetails";

const prisma = new PrismaClient();

interface EventPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900 flex items-center justify-center">
        <div className="glass-effect rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please sign in to view event details.
          </p>
          <Link href="/auth/signin">
            <button className="btn-gradient text-white px-6 py-3 rounded-xl">
              Sign In
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Get the actual user ID from database (same logic as in API routes)
  let actualUserId = session.user.id;
  
  try {
    // First try to find user by session ID
    let user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user && session.user.email) {
      // If not found by ID, try to find by email
      user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      
      if (user) {
        actualUserId = user.id;
        console.log('Using user ID from email lookup for Event detail page:', actualUserId);
      }
    }

    if (user) {
      actualUserId = user.id;
    }
  } catch (error) {
    console.error('Error resolving user ID:', error);
  }

  try {
    const { id } = await params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        }
      }
    });

    if (!event) {
      notFound();
    }

    // Check if user has access to this event
    const isCreator = event.creatorId === actualUserId;
    const isMember = event.members.some(member => member.userId === actualUserId);

    if (!isCreator && !isMember) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900 flex items-center justify-center">
          <div className="glass-effect rounded-2xl p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Access Restricted
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You don't have permission to view this event. You need to be a member or the creator.
            </p>
            <div className="space-y-3">
              <Link href="/events">
                <button className="w-full btn-gradient text-white px-6 py-3 rounded-xl">
                  Back to Events
                </button>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Back Navigation */}
            <div className="mb-6">
              <Link href="/events">
                <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Back to Events</span>
                </button>
              </Link>
            </div>

            {/* Event Details Component */}
            <EventDetails 
              event={event} 
              currentUserId={actualUserId}
              isCreator={isCreator}
              isMember={isMember}
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching event:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900 flex items-center justify-center">
        <div className="glass-effect rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Error Loading Event
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Sorry, we couldn't load this event. Please try again later.
          </p>
          <Link href="/events">
            <button className="btn-gradient text-white px-6 py-3 rounded-xl">
              Back to Events
            </button>
          </Link>
        </div>
      </div>
    );
  }
}
