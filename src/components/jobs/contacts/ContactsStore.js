import { getJobContacts, listRuns, getConnections } from "../../../services/api.js";

// How long a job's contacts count as fresh enough that a hover doesn't ask again.
const FRESH_MS = 30_000;

// What a job's Contacts section needs (its saved people and warm leads, its runs, your LinkedIn connections), fetched
// ahead of the panel and kept for the session. Each request takes a quarter to half a second, so asking only once the
// panel had opened meant the contacts always landed after it and pushed Notes down. Now a card starts the fetch when
// the pointer reaches it, and a job opened before shows what it had straight away while a fresh copy comes in.
class ContactsStore
  {
    #snapshots = new Map();
    #pending = new Map();

    // What the store last had for a job, { book, runs, connections, at }, or null if it's never been fetched.
    peek(jobId)
      {
        return this.#snapshots.get(jobId) || null;
      }

    // Fetches a job's contacts and keeps them. A fetch already out for the job is shared, not repeated.
    load(jobId)
      {
        if(this.#pending.has(jobId)) return this.#pending.get(jobId);
        const fetch = Promise.all([getJobContacts(jobId), listRuns(jobId), getConnections()])
          .then(([book, runs, connections]) => this.#keep(jobId, { book, runs, connections }))
          .finally(() => this.#pending.delete(jobId));
        this.#pending.set(jobId, fetch);
        return fetch;
      }

    // A head start for a panel that's probably about to open. Skipped when a fresh copy is already here, and a failure
    // is left for the panel's own load to show.
    warm(jobId)
      {
        const snapshot = this.peek(jobId);
        if(snapshot && Date.now() - snapshot.at < FRESH_MS) return;
        this.load(jobId).catch(() => {});
      }

    // Writes over part of a job's snapshot after the panel changed it, like a contact saved or taken off.
    update(jobId, changes)
      {
        const snapshot = this.peek(jobId);
        if(snapshot) this.#keep(jobId, { ...snapshot, ...changes });
      }

    #keep(jobId, snapshot)
      {
        const kept = { ...snapshot, at: Date.now() };
        this.#snapshots.set(jobId, kept);
        return kept;
      }
  }

export const contactsStore = new ContactsStore();
