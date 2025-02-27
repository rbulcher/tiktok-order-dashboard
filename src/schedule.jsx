import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Calendar,
  Clock,
  Printer,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Progress } from "./components/ui/progress";
import { Checkbox } from "./components/ui/checkbox";
import { Badge } from "./components/ui/badge";
import { normalizeComponentName } from "./lib/utils";

const ProductionScheduler = () => {
  const [selectedPlan, setSelectedPlan] = useState("72h");
  const [completedBatches, setCompletedBatches] = useState({});
  const [progressStats, setProgressStats] = useState({
    totalCompleted: 0,
    totalRemaining: 0,
    componentsCompleted: {},
    componentsRemaining: {},
    cupsProgress: {},
  });

  // Cup component requirements
  const cupRequirements = {
    mint: {
      name: "Mint",
      bottle: "Mint Bottle",
      lid: "Pink Lid",
      button: "Brown Button",
      ring: "Yellow Ring",
      handle: "White Handle",
      salesPercentage: 48.2,
    },
    white: {
      name: "White",
      bottle: "White Bottle",
      lid: "Gray Lid",
      button: "Black Button",
      ring: "Black Ring",
      handle: "White Handle",
      salesPercentage: 16.3,
    },
    pink: {
      name: "Pink",
      bottle: "Pink Bottle",
      lid: "Purple Lid",
      button: "Brown Button",
      ring: "Yellow Ring",
      handle: "Yellow Handle",
      salesPercentage: 14.2,
    },
    purple: {
      name: "Purple",
      bottle: "Purple Bottle",
      lid: "Magenta Lid",
      button: "Orange Button",
      ring: "Blue Ring",
      handle: "Yellow Handle",
      salesPercentage: 10.6,
    },
    orange: {
      name: "Orange",
      bottle: "Orange Bottle",
      lid: "Gray Lid",
      button: "Orange Button",
      ring: "White Ring",
      handle: "Brown Handle",
      salesPercentage: 5.7,
    },
    lime: {
      name: "Lime",
      bottle: "Lime Bottle",
      lid: "Blue Lid",
      button: "Mint Button",
      ring: "Mint Ring",
      handle: "Green Handle",
      salesPercentage: 5.0,
    },
  };

  // Production constraints
  const productionConstraints = {
    bottles: { capacity: 24, time: 13 },
    lids: { capacity: 30, time: 8 },
    handles: { capacity: 56, time: 3 },
    buttons: { capacity: 60, time: 1.5 },
    rings: { capacity: 62, time: 0.75 },
  };

  // 72-hour production schedule
  const schedule72h = {
    totalHours: 72,
    totalCups: 254,
    distribution: {
      mint: 120,
      white: 48,
      pink: 36,
      purple: 24,
      orange: 14,
      lime: 12,
    },
    printers: {
      printer1: {
        name: "Mint Bottles",
        batches: [
          { id: "p1_d1_b1", day: 1, item: "Mint Bottles", count: 24, time: 13 },
          { id: "p1_d1_b2", day: 1, item: "Mint Bottles", count: 24, time: 13, startHour: 13 },
          { id: "p1_d2_b1", day: 2, item: "Mint Bottles", count: 24, time: 13 },
          { id: "p1_d2_b2", day: 2, item: "Mint Bottles", count: 24, time: 13, startHour: 13 },
          { id: "p1_d3_b1", day: 3, item: "Mint Bottles", count: 24, time: 13 },
        ],
      },
      printer2: {
        name: "Other Bottles",
        batches: [
          { id: "p2_d1_b1", day: 1, item: "White Bottles", count: 24, time: 13 },
          { id: "p2_d1_b2", day: 1, item: "White Bottles", count: 24, time: 13, startHour: 13 },
          { id: "p2_d2_b1", day: 2, item: "Pink Bottles", count: 24, time: 13 },
          { id: "p2_d2_b2", day: 2, item: "Pink Bottles", count: 12, time: 6.5, startHour: 13 },
          { id: "p2_d3_b1", day: 3, item: "Purple Bottles", count: 24, time: 13 },
          { id: "p2_d3_b2", day: 3, item: "Orange Bottles", count: 14, time: 7.6, startHour: 13 },
          { id: "p2_d3_b3", day: 3, item: "Lime Bottles", count: 12, time: 6.5, startHour: 20.6 },
        ],
      },
      printer3: {
        name: "Lids",
        batches: [
          { id: "p3_d1_b1", day: 1, item: "Pink Lids", count: 30, time: 8 },
          { id: "p3_d1_b2", day: 1, item: "Pink Lids", count: 30, time: 8, startHour: 8 },
          { id: "p3_d1_b3", day: 1, item: "Pink Lids", count: 30, time: 8, startHour: 16 },
          { id: "p3_d2_b1", day: 2, item: "Pink Lids", count: 30, time: 8 },
          { id: "p3_d2_b2", day: 2, item: "Gray Lids", count: 30, time: 8, startHour: 8 },
          { id: "p3_d2_b3", day: 2, item: "Gray Lids", count: 30, time: 8, startHour: 16 },
          { id: "p3_d3_b1", day: 3, item: "Purple Lids", count: 30, time: 8 },
          { id: "p3_d3_b2", day: 3, item: "Purple Lids", count: 30, time: 8, startHour: 8 },
          { id: "p3_d3_b3", day: 3, item: "Magenta Lids", count: 24, time: 6.4, startHour: 16 },
          { id: "p3_d3_b4", day: 3, item: "Blue Lids", count: 12, time: 3.2, startHour: 22.4 },
        ],
      },
      printer4: {
        name: "Handles, Buttons & Rings",
        batches: [
          { id: "p4_d1_b1", day: 1, item: "White Handles", count: 56, time: 3 },
          { id: "p4_d1_b2", day: 1, item: "White Handles", count: 56, time: 3, startHour: 3 },
          { id: "p4_d1_b3", day: 1, item: "White Handles", count: 56, time: 3, startHour: 6 },
          { id: "p4_d1_b4", day: 1, item: "Yellow Handles", count: 56, time: 3, startHour: 9 },
          { id: "p4_d1_b5", day: 1, item: "Yellow Handles", count: 56, time: 3, startHour: 12 },
          { id: "p4_d1_b6", day: 1, item: "Brown Handles", count: 56, time: 3, startHour: 15 },
          { id: "p4_d1_b7", day: 1, item: "Green Handles", count: 56, time: 3, startHour: 18 },
          { id: "p4_d1_b8", day: 1, item: "Brown Buttons", count: 60, time: 1.5, startHour: 21 },
          { id: "p4_d1_b9", day: 1, item: "Brown Buttons", count: 60, time: 1.5, startHour: 22.5 },
          { id: "p4_d2_b1", day: 2, item: "Brown Buttons", count: 60, time: 1.5 },
          { id: "p4_d2_b2", day: 2, item: "Black Buttons", count: 60, time: 1.5, startHour: 1.5 },
          { id: "p4_d2_b3", day: 2, item: "Orange Buttons", count: 60, time: 1.5, startHour: 3 },
          { id: "p4_d2_b4", day: 2, item: "Mint Buttons", count: 60, time: 1.5, startHour: 4.5 },
          { id: "p4_d2_b5", day: 2, item: "Yellow Rings", count: 62, time: 0.75, startHour: 6 },
          { id: "p4_d2_b6", day: 2, item: "Yellow Rings", count: 62, time: 0.75, startHour: 6.75 },
          { id: "p4_d2_b7", day: 2, item: "Yellow Rings", count: 62, time: 0.75, startHour: 7.5 },
          { id: "p4_d2_b8", day: 2, item: "Black Rings", count: 62, time: 0.75, startHour: 8.25 },
          { id: "p4_d2_b9", day: 2, item: "Blue Rings", count: 62, time: 0.75, startHour: 9 },
          { id: "p4_d2_b10", day: 2, item: "White Rings", count: 62, time: 0.75, startHour: 9.75 },
          { id: "p4_d2_b11", day: 2, item: "Mint Rings", count: 62, time: 0.75, startHour: 10.5 },
        ],
      },
    },
  };

  // 1-week production schedule
  const schedule1week = {
    totalHours: 168,
    totalCups: 597,
    distribution: {
      mint: 288,
      white: 96,
      pink: 85,
      purple: 64,
      orange: 34,
      lime: 30,
    },
    printers: {
      printer1: {
        name: "Mint Bottles",
        batches: [
          { id: "p1_d1_b1", day: 1, item: "Mint Bottles", count: 24, time: 13 },
          { id: "p1_d1_b2", day: 1, item: "Mint Bottles", count: 24, time: 13, startHour: 13 },
          { id: "p1_d2_b1", day: 2, item: "Mint Bottles", count: 24, time: 13 },
          { id: "p1_d2_b2", day: 2, item: "Mint Bottles", count: 24, time: 13, startHour: 13 },
          { id: "p1_d3_b1", day: 3, item: "Mint Bottles", count: 24, time: 13 },
          { id: "p1_d3_b2", day: 3, item: "Mint Bottles", count: 24, time: 13, startHour: 13 },
          { id: "p1_d4_b1", day: 4, item: "Mint Bottles", count: 24, time: 13 },
          { id: "p1_d4_b2", day: 4, item: "Mint Bottles", count: 24, time: 13, startHour: 13 },
          { id: "p1_d5_b1", day: 5, item: "Mint Bottles", count: 24, time: 13 },
          { id: "p1_d5_b2", day: 5, item: "Mint Bottles", count: 24, time: 13, startHour: 13 },
          { id: "p1_d6_b1", day: 6, item: "Mint Bottles", count: 24, time: 13 },
          { id: "p1_d6_b2", day: 6, item: "Mint Bottles", count: 24, time: 13, startHour: 13 },
          { id: "p1_d7_b1", day: 7, item: "Mint Bottles", count: 24, time: 13 },
        ],
      },
      printer2: {
        name: "Other Bottles",
        batches: [
          { id: "p2_d1_b1", day: 1, item: "White Bottles", count: 24, time: 13 },
          { id: "p2_d1_b2", day: 1, item: "White Bottles", count: 24, time: 13, startHour: 13 },
          { id: "p2_d2_b1", day: 2, item: "White Bottles", count: 24, time: 13 },
          { id: "p2_d2_b2", day: 2, item: "White Bottles", count: 24, time: 13, startHour: 13 },
          { id: "p2_d3_b1", day: 3, item: "Pink Bottles", count: 24, time: 13 },
          { id: "p2_d3_b2", day: 3, item: "Pink Bottles", count: 24, time: 13, startHour: 13 },
          { id: "p2_d4_b1", day: 4, item: "Pink Bottles", count: 24, time: 13 },
          { id: "p2_d4_b2", day: 4, item: "Pink Bottles", count: 13, time: 7, startHour: 13 },
          { id: "p2_d5_b1", day: 5, item: "Purple Bottles", count: 24, time: 13 },
          { id: "p2_d5_b2", day: 5, item: "Purple Bottles", count: 24, time: 13, startHour: 13 },
          { id: "p2_d6_b1", day: 6, item: "Purple Bottles", count: 16, time: 8.5 },
          { id: "p2_d6_b2", day: 6, item: "Orange Bottles", count: 24, time: 13, startHour: 8.5 },
          { id: "p2_d7_b1", day: 7, item: "Orange Bottles", count: 10, time: 5.5 },
          { id: "p2_d7_b2", day: 7, item: "Lime Bottles", count: 30, time: 16, startHour: 5.5 },
        ],
      },
      printer3: {
        name: "Lids",
        batches: [
          { id: "p3_d1_b1", day: 1, item: "Pink Lids", count: 30, time: 8 },
          { id: "p3_d1_b2", day: 1, item: "Pink Lids", count: 30, time: 8, startHour: 8 },
          { id: "p3_d1_b3", day: 1, item: "Pink Lids", count: 30, time: 8, startHour: 16 },
          { id: "p3_d2_b1", day: 2, item: "Pink Lids", count: 30, time: 8 },
          { id: "p3_d2_b2", day: 2, item: "Gray Lids", count: 30, time: 8, startHour: 8 },
          { id: "p3_d2_b3", day: 2, item: "Gray Lids", count: 30, time: 8, startHour: 16 },
          { id: "p3_d3_b1", day: 3, item: "Gray Lids", count: 30, time: 8 },
          { id: "p3_d3_b2", day: 3, item: "Gray Lids", count: 30, time: 8, startHour: 8 },
          { id: "p3_d3_b3", day: 3, item: "Purple Lids", count: 30, time: 8, startHour: 16 },
          { id: "p3_d4_b1", day: 4, item: "Purple Lids", count: 30, time: 8 },
          { id: "p3_d4_b2", day: 4, item: "Magenta Lids", count: 30, time: 8, startHour: 8 },
          { id: "p3_d4_b3", day: 4, item: "Magenta Lids", count: 30, time: 8, startHour: 16 },
          { id: "p3_d5_b1", day: 5, item: "Blue Lids", count: 30, time: 8 },
          { id: "p3_d5_b2", day: 5, item: "Magenta Lids", count: 30, time: 8, startHour: 8 },
          { id: "p3_d5_b3", day: 5, item: "Gray Lids", count: 30, time: 8, startHour: 16 },
          { id: "p3_d6_b1", day: 6, item: "Blue Lids", count: 30, time: 8 },
          { id: "p3_d6_b2", day: 6, item: "Gray Lids", count: 30, time: 8, startHour: 8 },
          { id: "p3_d6_b3", day: 6, item: "Gray Lids", count: 30, time: 8, startHour: 16 },
          { id: "p3_d7_b1", day: 7, item: "Blue Lids", count: 30, time: 8 },
        ],
      },
      printer4: {
        name: "Handles, Buttons & Rings",
        batches: [
          // Day 1
          { id: "p4_d1_b1", day: 1, item: "White Handles", count: 56, time: 3 },
          { id: "p4_d1_b2", day: 1, item: "White Handles", count: 56, time: 3, startHour: 3 },
          { id: "p4_d1_b3", day: 1, item: "White Handles", count: 56, time: 3, startHour: 6 },
          { id: "p4_d1_b4", day: 1, item: "Yellow Handles", count: 56, time: 3, startHour: 9 },
          { id: "p4_d1_b5", day: 1, item: "Brown Buttons", count: 60, time: 1.5, startHour: 12 },
          { id: "p4_d1_b6", day: 1, item: "Brown Buttons", count: 60, time: 1.5, startHour: 13.5 },
          { id: "p4_d1_b7", day: 1, item: "Yellow Rings", count: 62, time: 0.75, startHour: 15 },
          { id: "p4_d1_b8", day: 1, item: "Yellow Rings", count: 62, time: 0.75, startHour: 15.75 },
          { id: "p4_d1_b9", day: 1, item: "Yellow Rings", count: 62, time: 0.75, startHour: 16.5 },
          
          // Day 2
          { id: "p4_d2_b1", day: 2, item: "Yellow Handles", count: 56, time: 3 },
          { id: "p4_d2_b2", day: 2, item: "Yellow Handles", count: 56, time: 3, startHour: 3 },
          { id: "p4_d2_b3", day: 2, item: "Brown Handles", count: 56, time: 3, startHour: 6 },
          { id: "p4_d2_b4", day: 2, item: "Black Buttons", count: 60, time: 1.5, startHour: 9 },
          { id: "p4_d2_b5", day: 2, item: "Black Buttons", count: 60, time: 1.5, startHour: 10.5 },
          { id: "p4_d2_b6", day: 2, item: "Black Rings", count: 62, time: 0.75, startHour: 12 },
          { id: "p4_d2_b7", day: 2, item: "Black Rings", count: 62, time: 0.75, startHour: 12.75 },
          
          // Day 3
          { id: "p4_d3_b1", day: 3, item: "Green Handles", count: 56, time: 3 },
          { id: "p4_d3_b2", day: 3, item: "Orange Buttons", count: 60, time: 1.5, startHour: 3 },
          { id: "p4_d3_b3", day: 3, item: "Orange Buttons", count: 60, time: 1.5, startHour: 4.5 },
          { id: "p4_d3_b4", day: 3, item: "Blue Rings", count: 62, time: 0.75, startHour: 6 },
          { id: "p4_d3_b5", day: 3, item: "Blue Rings", count: 62, time: 0.75, startHour: 6.75 },
          
          // Day 4
          { id: "p4_d4_b1", day: 4, item: "White Handles", count: 56, time: 3 },
          { id: "p4_d4_b2", day: 4, item: "White Handles", count: 56, time: 3, startHour: 3 },
          { id: "p4_d4_b3", day: 4, item: "Mint Buttons", count: 60, time: 1.5, startHour: 6 },
          { id: "p4_d4_b4", day: 4, item: "Mint Buttons", count: 60, time: 1.5, startHour: 7.5 },
          { id: "p4_d4_b5", day: 4, item: "Mint Rings", count: 62, time: 0.75, startHour: 9 },
          { id: "p4_d4_b6", day: 4, item: "Mint Rings", count: 62, time: 0.75, startHour: 9.75 },
          
          // Day 5
          { id: "p4_d5_b1", day: 5, item: "Yellow Handles", count: 56, time: 3 },
          { id: "p4_d5_b2", day: 5, item: "Yellow Handles", count: 56, time: 3, startHour: 3 },
          { id: "p4_d5_b3", day: 5, item: "Brown Buttons", count: 60, time: 1.5, startHour: 6 },
          { id: "p4_d5_b4", day: 5, item: "White Rings", count: 62, time: 0.75, startHour: 7.5 },
          { id: "p4_d5_b5", day: 5, item: "White Rings", count: 62, time: 0.75, startHour: 8.25 },
          
          // Day 6
          { id: "p4_d6_b1", day: 6, item: "Brown Handles", count: 56, time: 3 },
          { id: "p4_d6_b2", day: 6, item: "Brown Handles", count: 56, time: 3, startHour: 3 },
          { id: "p4_d6_b3", day: 6, item: "Orange Buttons", count: 60, time: 1.5, startHour: 6 },
          { id: "p4_d6_b4", day: 6, item: "Yellow Rings", count: 62, time: 0.75, startHour: 7.5 },
          { id: "p4_d6_b5", day: 6, item: "Yellow Rings", count: 62, time: 0.75, startHour: 8.25 },
          
          // Day 7
          { id: "p4_d7_b1", day: 7, item: "Green Handles", count: 56, time: 3 },
          { id: "p4_d7_b2", day: 7, item: "White Buttons", count: 60, time: 1.5, startHour: 3 },
          { id: "p4_d7_b3", day: 7, item: "White Rings", count: 62, time: 0.75, startHour: 4.5 },
        ],
      },
    },
  };

  // Toggle batch completion and force progress recalculation
  const toggleBatchCompletion = (batchId) => {
    setCompletedBatches((prev) => {
      // Create a new object to ensure React detects the change
      const updated = { ...prev };
      // Toggle the completion status
      updated[batchId] = !prev[batchId];
      return updated;
    });
  };

  // Calculate progress whenever completed batches or selected plan changes
  useEffect(() => {
    const activeSchedule = selectedPlan === "72h" ? schedule72h : schedule1week;
    const componentsCompleted = {};
    const componentsRemaining = {};
    const cupsProgress = {};

    // Initialize cup progress tracking for each cup type
    Object.keys(activeSchedule.distribution).forEach((cupType) => {
      cupsProgress[cupType] = {
        total: activeSchedule.distribution[cupType],
        completed: 0,
        bottlesCompleted: 0,
        lidsCompleted: 0,
        buttonsCompleted: 0,
        ringsCompleted: 0,
        handlesCompleted: 0,
      };
    });

    // Process all batches
    Object.values(activeSchedule.printers).forEach((printer) => {
      printer.batches.forEach((batch) => {
        const isComplete = completedBatches[batch.id] || false;
        const normalizedBatchItem = normalizeComponentName(batch.item);

        if (isComplete) {
          componentsCompleted[batch.item] = (componentsCompleted[batch.item] || 0) + batch.count;
        } else {
          componentsRemaining[batch.item] = (componentsRemaining[batch.item] || 0) + batch.count;
        }

        if (isComplete) {
          // Map the completed batch to cup components
          Object.entries(cupRequirements).forEach(([cupType, requirements]) => {
            const batchItemLower = batch.item.toLowerCase();
            if (batchItemLower.includes(requirements.bottle.toLowerCase())) {
              cupsProgress[cupType].bottlesCompleted += batch.count;
            } else if (batchItemLower.includes(requirements.lid.toLowerCase())) {
              cupsProgress[cupType].lidsCompleted += batch.count;
            } else if (batchItemLower.includes(requirements.button.toLowerCase())) {
              cupsProgress[cupType].buttonsCompleted += batch.count;
            } else if (batchItemLower.includes(requirements.ring.toLowerCase())) {
              cupsProgress[cupType].ringsCompleted += batch.count;
            } else if (batchItemLower.includes(requirements.handle.toLowerCase())) {
              cupsProgress[cupType].handlesCompleted += batch.count;
            }
          });
        }
      });
    });

    // Calculate completed cups for each type
    Object.entries(cupsProgress).forEach(([cupType, data]) => {
      const completed = Math.min(
        data.bottlesCompleted,
        data.lidsCompleted,
        data.buttonsCompleted,
        data.ringsCompleted,
        data.handlesCompleted
      );
      cupsProgress[cupType].completed = Math.min(completed, data.total);
    });

    // Calculate total completed and remaining
    const totalCompleted = Object.values(cupsProgress).reduce(
      (sum, data) => sum + data.completed,
      0
    );
    const totalRemaining = activeSchedule.totalCups - totalCompleted;

    setProgressStats({
      totalCompleted,
      totalRemaining,
      componentsCompleted,
      componentsRemaining,
      cupsProgress,
    });
  }, [completedBatches, selectedPlan]); // Only depend on these two values

  // Select the active schedule based on user selection
  const activeSchedule = selectedPlan === "72h" ? schedule72h : schedule1week;

  // Prepare data for charts
  const distributionData = Object.entries(activeSchedule.distribution).map(
    ([color, count]) => ({
      name: cupRequirements[color].name,
      cups: count,
      percentage: ((count / activeSchedule.totalCups) * 100).toFixed(1),
    })
  );

  // Progress chart data
  const progressData = Object.entries(progressStats.cupsProgress || {}).map(
    ([color, data]) => ({
      name: cupRequirements[color].name,
      completed: data.completed,
      remaining: data.total - data.completed,
    })
  );

  // Pie chart data for overall completion
  const completionData = [
    { name: "Completed", value: progressStats.totalCompleted },
    { name: "Remaining", value: progressStats.totalRemaining },
  ];

  const COLORS = [
    "#4CAF50",
    "#F44336",
    "#2196F3",
    "#FF9800",
    "#9C27B0",
    "#795548",
  ];

  // Calculate component needs
  const calculateComponentNeeds = () => {
    const needs = {
      bottles: {},
      lids: {},
      buttons: {},
      rings: {},
      handles: {},
    };
    
    // Calculate total needs based on cup distribution
    Object.entries(activeSchedule.distribution).forEach(([cupType, count]) => {
      const cup = cupRequirements[cupType];
      
      // Add components to their respective categories using normalized names
      const bottle = normalizeComponentName(cup.bottle);
      const lid = normalizeComponentName(cup.lid);
      const button = normalizeComponentName(cup.button);
      const ring = normalizeComponentName(cup.ring);
      const handle = normalizeComponentName(cup.handle);
      
      needs.bottles[cup.bottle] = (needs.bottles[cup.bottle] || 0) + count;
      needs.lids[cup.lid] = (needs.lids[cup.lid] || 0) + count;
      needs.buttons[cup.button] = (needs.buttons[cup.button] || 0) + count;
      needs.rings[cup.ring] = (needs.rings[cup.ring] || 0) + count;
      needs.handles[cup.handle] = (needs.handles[cup.handle] || 0) + count;
    });
    
    return needs;
  };

  const componentNeeds = calculateComponentNeeds();

  // Function to render the daily production schedule
  const renderDailySchedule = (day) => {
    return (
      <div className="space-y-4">
        {Object.entries(activeSchedule.printers).map(([printerKey, printer]) => {
          const dayBatches = printer.batches.filter((batch) => batch.day === day);

          if (dayBatches.length === 0) return null;

          return (
            <Card
              key={printerKey}
              className="border-l-4"
              style={{
                borderLeftColor:
                  printerKey === "printer1"
                    ? "#60a5fa"
                    : printerKey === "printer2"
                    ? "#f97316"
                    : printerKey === "printer3"
                    ? "#10b981"
                    : "#8b5cf6",
              }}
            >
              <CardHeader className="py-3">
                <CardTitle className="text-lg flex items-center">
                  <Printer className="mr-2 h-5 w-5" /> {printer.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="space-y-2">
                  {dayBatches.map((batch) => {
                    const isComplete = completedBatches[batch.id] || false;

                    return (
                      <div
                        key={batch.id}
                        className={`p-3 rounded-md border ${
                          isComplete
                            ? "bg-green-50 border-green-100"
                            : "bg-gray-50 border-gray-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium flex items-center">
                            {isComplete && (
                              <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                            )}
                            {!isComplete && (
                              <XCircle className="mr-2 h-4 w-4 text-gray-300" />
                            )}
                            {batch.item} (Qty: {batch.count})
                          </div>
                          <div>
                            <Checkbox
                              id={batch.id}
                              checked={isComplete}
                              onCheckedChange={() => toggleBatchCompletion(batch.id)}
                            />
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {batch.startHour
                            ? `Start: Hour ${Math.floor(batch.startHour)}`
                            : "Start: Hour 0"}{" "}
                          | Duration: {batch.time} hours
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-xl font-bold">
            Cup Keychain Production Tracker
          </CardTitle>
          <CardDescription>
            Track your cup keychain production progress and manage your printing
            schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="72h" onValueChange={setSelectedPlan}>
            <TabsList className="mb-4">
              <TabsTrigger value="72h" className="flex items-center">
                <Clock className="mr-2 h-4 w-4" /> 72-Hour Plan
              </TabsTrigger>
              <TabsTrigger value="1week" className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" /> 1-Week Plan
              </TabsTrigger>
            </TabsList>

            <TabsContent value="72h" className="space-y-4">
              <ProductionSummary
                schedule={schedule72h}
                progress={progressStats}
              />
            </TabsContent>

            <TabsContent value="1week" className="space-y-4">
              <ProductionSummary
                schedule={schedule1week}
                progress={progressStats}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
            <CardDescription>
              Total progress for {activeSchedule.totalCups} cups
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="w-64 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={completionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {completionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? "#4CAF50" : "#F5F5F5"}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, "Cups"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
              <div className="text-2xl font-bold">
                {progressStats.totalCompleted} / {activeSchedule.totalCups} cups
                completed
              </div>
              <Progress
                value={
                  (progressStats.totalCompleted / activeSchedule.totalCups) *
                  100
                }
                className="h-3 mt-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cup Progress by Type</CardTitle>
            <CardDescription>
              Completion status for each cup color
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="completed"
                  name="Completed"
                  stackId="a"
                  fill="#4CAF50"
                />
                <Bar
                  dataKey="remaining"
                  name="Remaining"
                  stackId="a"
                  fill="#F5F5F5"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Component Progress</CardTitle>
          <CardDescription>Completed vs remaining components</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <ComponentProgressList
              title="Bottles"
              completed={progressStats.componentsCompleted}
              remaining={progressStats.componentsRemaining}
              needs={componentNeeds.bottles}
            />
            <ComponentProgressList
              title="Lids"
              completed={progressStats.componentsCompleted}
              remaining={progressStats.componentsRemaining}
              needs={componentNeeds.lids}
            />
            <ComponentProgressList
              title="Buttons"
              completed={progressStats.componentsCompleted}
              remaining={progressStats.componentsRemaining}
              needs={componentNeeds.buttons}
            />
            <ComponentProgressList
              title="Rings"
              completed={progressStats.componentsCompleted}
              remaining={progressStats.componentsRemaining}
              needs={componentNeeds.rings}
            />
            <ComponentProgressList
              title="Handles"
              completed={progressStats.componentsCompleted}
              remaining={progressStats.componentsRemaining}
              needs={componentNeeds.handles}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="1" className="mb-6">
        <TabsList className="w-full flex overflow-x-auto border-b">
          {Array.from({ length: selectedPlan === "72h" ? 3 : 7 }, (_, i) => (
            <TabsTrigger key={i + 1} value={String(i + 1)} className="flex-1">
              Day {i + 1}
            </TabsTrigger>
          ))}
        </TabsList>

        {Array.from({ length: selectedPlan === "72h" ? 3 : 7 }, (_, i) => (
          <TabsContent key={i + 1} value={String(i + 1)}>
            {renderDailySchedule(i + 1)}
          </TabsContent>
        ))}
      </Tabs>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Missing Components Analysis</CardTitle>
          <CardDescription>
            What you need to complete your remaining cups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(progressStats.cupsProgress || {}).map(
              ([color, data]) => {
                const cupsRemaining = data.total - data.completed;
                if (cupsRemaining <= 0) return null;

                const cup = cupRequirements[color];
                const bottlesNeeded = Math.max(
                  0,
                  cupsRemaining - data.bottlesCompleted
                );
                const lidsNeeded = Math.max(
                  0,
                  cupsRemaining - data.lidsCompleted
                );
                const buttonsNeeded = Math.max(
                  0,
                  cupsRemaining - data.buttonsCompleted
                );
                const ringsNeeded = Math.max(
                  0,
                  cupsRemaining - data.ringsCompleted
                );
                const handlesNeeded = Math.max(
                  0,
                  cupsRemaining - data.handlesCompleted
                );

                return (
                  <div key={color} className="p-4 bg-gray-50 rounded-md border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold">{cup.name} Cups</div>
                      <Badge variant="outline">
                        {data.completed} / {data.total} completed
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      <div
                        className={`p-2 rounded ${
                          bottlesNeeded > 0 ? "bg-red-50" : "bg-green-50"
                        }`}
                      >
                        <div className="text-sm font-medium">{cup.bottle}</div>
                        <div
                          className={`${
                            bottlesNeeded > 0
                              ? "text-red-700"
                              : "text-green-700"
                          } font-bold`}
                        >
                          Need: {bottlesNeeded}
                        </div>
                      </div>
                      <div
                        className={`p-2 rounded ${
                          lidsNeeded > 0 ? "bg-red-50" : "bg-green-50"
                        }`}
                      >
                        <div className="text-sm font-medium">{cup.lid}</div>
                        <div
                          className={`${
                            lidsNeeded > 0 ? "text-red-700" : "text-green-700"
                          } font-bold`}
                        >
                          Need: {lidsNeeded}
                        </div>
                      </div>
                      <div
                        className={`p-2 rounded ${
                          buttonsNeeded > 0 ? "bg-red-50" : "bg-green-50"
                        }`}
                      >
                        <div className="text-sm font-medium">{cup.button}</div>
                        <div
                          className={`${
                            buttonsNeeded > 0
                              ? "text-red-700"
                              : "text-green-700"
                          } font-bold`}
                        >
                          Need: {buttonsNeeded}
                        </div>
                      </div>
                      <div
                        className={`p-2 rounded ${
                          ringsNeeded > 0 ? "bg-red-50" : "bg-green-50"
                        }`}
                      >
                        <div className="text-sm font-medium">{cup.ring}</div>
                        <div
                          className={`${
                            ringsNeeded > 0 ? "text-red-700" : "text-green-700"
                          } font-bold`}
                        >
                          Need: {ringsNeeded}
                        </div>
                      </div>
                      <div
                        className={`p-2 rounded ${
                          handlesNeeded > 0 ? "bg-red-50" : "bg-green-50"
                        }`}
                      >
                        <div className="text-sm font-medium">{cup.handle}</div>
                        <div
                          className={`${
                            handlesNeeded > 0
                              ? "text-red-700"
                              : "text-green-700"
                          } font-bold`}
                        >
                          Need: {handlesNeeded}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper components
const ComponentProgressList = ({ title, completed, remaining, needs }) => {
  // Filter the components that belong to this category
  const relevantComponents = Object.keys(needs || {});

  return (
    <Card className="border">
      <CardHeader className="py-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        <div className="space-y-2">
          {relevantComponents.map((name) => {
            const total = needs[name];
            const completedCount = completed[name] || 0;
            const remainingCount = remaining[name] || 0;
            const percentComplete = total ? (completedCount / total) * 100 : 0;

            return (
              <div key={name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{name}</span>
                  <span>
                    {completedCount} / {total}
                  </span>
                </div>
                <Progress value={percentComplete} className="h-2" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const ComponentList = ({ title, items }) => (
  <Card className="border">
    <CardHeader className="py-3">
      <CardTitle className="text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent className="py-2">
      <div className="space-y-1">
        {Object.entries(items).map(([name, count]) => (
          <div key={name} className="flex justify-between text-sm">
            <span>{name}:</span>
            <span className="font-medium">{count}</span>
          </div>
        ))}
        <div className="border-t pt-1 mt-2 font-medium flex justify-between">
          <span>Total:</span>
          <span>
            {Object.values(items).reduce((sum, count) => sum + count, 0)}
          </span>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ProductionSummary = ({ schedule, progress }) => {
  const percentComplete = schedule.totalCups
    ? (progress.totalCompleted / schedule.totalCups) * 100
    : 0;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card className="bg-gray-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {progress.totalCompleted} cups
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {percentComplete.toFixed(1)}% of plan
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {progress.totalRemaining} cups
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {(100 - percentComplete).toFixed(1)}% of plan
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Daily Target</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round(schedule.totalCups / (schedule.totalHours / 24))} cups
            </div>
            <p className="text-sm text-gray-500 mt-1">Average per day</p>
          </CardContent>
        </Card>
      </div>

      <Progress value={percentComplete} className="h-4 mb-2" />
      <div className="text-sm text-center text-gray-600">
        {percentComplete.toFixed(1)}% Complete ({progress.totalCompleted} of{" "}
        {schedule.totalCups} cups)
      </div>
    </div>
  );
};

export default ProductionScheduler;