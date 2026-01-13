import { EventStore } from './EventStore';
export class MemoryEventStore extends EventStore {
    events = new Map();
    eventsByType = new Map();
    eventsBySource = new Map();
    eventsByCorrelation = new Map();
    async save(event) {
        // Store by ID
        this.events.set(event.id, event);
        // Store by type
        if (!this.eventsByType.has(event.type)) {
            this.eventsByType.set(event.type, []);
        }
        this.eventsByType.get(event.type).push(event);
        // Store by source
        if (!this.eventsBySource.has(event.source)) {
            this.eventsBySource.set(event.source, []);
        }
        this.eventsBySource.get(event.source).push(event);
        // Store by correlation ID
        if (event.correlationId) {
            if (!this.eventsByCorrelation.has(event.correlationId)) {
                this.eventsByCorrelation.set(event.correlationId, []);
            }
            this.eventsByCorrelation.get(event.correlationId).push(event);
        }
    }
    async getEvents(filter) {
        let events = Array.from(this.events.values());
        // Filter by type
        if (filter?.type) {
            events = events.filter(event => event.type === filter.type);
        }
        // Filter by source
        if (filter?.source) {
            events = events.filter(event => event.source === filter.source);
        }
        // Filter by date range
        if (filter?.fromDate) {
            events = events.filter(event => event.timestamp >= filter.fromDate);
        }
        if (filter?.toDate) {
            events = events.filter(event => event.timestamp <= filter.toDate);
        }
        // Filter by correlation ID
        if (filter?.correlationId) {
            events = events.filter(event => event.correlationId === filter.correlationId);
        }
        // Sort by timestamp (newest first)
        events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        return events;
    }
    async getEvent(id) {
        return this.events.get(id) || null;
    }
    /**
     * Get events by type
     */
    async getEventsByType(type) {
        return this.eventsByType.get(type) || [];
    }
    /**
     * Get events by source
     */
    async getEventsBySource(source) {
        return this.eventsBySource.get(source) || [];
    }
    /**
     * Get events by correlation ID
     */
    async getEventsByCorrelation(correlationId) {
        return this.eventsByCorrelation.get(correlationId) || [];
    }
    /**
     * Clear all events (useful for testing)
     */
    clear() {
        this.events.clear();
        this.eventsByType.clear();
        this.eventsBySource.clear();
        this.eventsByCorrelation.clear();
    }
    /**
     * Get count of events
     */
    getCount() {
        return this.events.size;
    }
    /**
     * Get statistics
     */
    getStats() {
        const eventTypes = {};
        const sources = {};
        for (const [type, events] of this.eventsByType) {
            eventTypes[type] = events.length;
        }
        for (const [source, events] of this.eventsBySource) {
            sources[source] = events.length;
        }
        return {
            totalEvents: this.events.size,
            eventTypes,
            sources,
            correlations: this.eventsByCorrelation.size,
        };
    }
}
