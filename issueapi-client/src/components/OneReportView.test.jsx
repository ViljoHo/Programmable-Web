import { render, screen } from "@testing-library/react"
import { vi } from "vitest"
import { MemoryRouter } from 'react-router-dom'
import OneReportView from "./OneReportView"
import { useReport } from "../hooks/useReport"

// Mock the dependencies
vi.mock("../hooks/useReport", () => ({
    useReport: vi.fn()
}))

vi.mock("../stores/userStore", () => ({
    useUser: vi.fn(() => ({ id: 1, name: "testuser" }))
}))

vi.mock("../stores/notificationStore", () => ({
    useNotificationActions: vi.fn(() => ({
        showNotification: vi.fn()
    }))
}))

vi.mock("../hooks/useReportTypes", () => ({
    useReportTypes: vi.fn(() => ({
        reportTypes: [{ id: 1, name: 'test type' }],
        isPending: false
    }))
}))

test("renders report's contents correctly", () => {
    const report = {
        id: 10,
        description: "test description",
        location: "test location",
        timestamp: "2022-01-01T00:00:00Z",
        upvote_count: 5,
        user_name: "testuser",
        report_type: { name: "test type" },
        comments: []
    }

    useReport.mockReturnValue({
        report,
        isPending: false,
        hasUpvoted: false,
        deleteReport: vi.fn(),
        addComment: vi.fn(),
        deleteComment: vi.fn(),
        upvote: vi.fn(),
        removeUpvote: vi.fn(),
        updateReport: vi.fn()
    })

    render(
        <MemoryRouter>
            <OneReportView />
        </MemoryRouter>
    )

    expect(screen.getByText("test description")).toBeDefined()
    expect(screen.getByText("test location")).toBeDefined()
    expect(screen.getByText("5")).toBeDefined()
    expect(screen.getByText("testuser")).toBeDefined()
})