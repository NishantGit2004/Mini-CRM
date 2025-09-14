import axiosInstance from "./axiosInstance";

// --- Segment APIs ---
export const createSegmentAPI = (segment) =>
  axiosInstance.post("/segments", segment).then(res => res.data);

export const previewSegmentAPI = (segmentId) =>
  axiosInstance.get(`/segments/${segmentId}/preview`).then(res => res.data);

// --- Campaign APIs ---
export const createCampaignAPI = ({ segment_id, message_template, channel }) =>
  axiosInstance.post("/campaigns", { segment_id, message_template, channel }).then(res => res.data);

export const listCampaignsAPI = () =>
  axiosInstance.get("/campaigns").then(res => res.data);