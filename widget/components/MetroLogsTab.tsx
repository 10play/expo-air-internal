import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import type { MetroLogMessage } from "../services/websocket";

interface MetroLogsTabProps {
  logs: MetroLogMessage[];
}

export function MetroLogsTab({ logs }: MetroLogsTabProps) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (logs.length > 0) {
      scrollRef.current?.scrollToEnd({ animated: true });
    }
  }, [logs.length]);

  if (logs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No logs yet</Text>
        <Text style={styles.emptySubtext}>Metro logs will appear here</Text>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {logs.map((log, index) => (
        <Text key={index} style={styles.logLine}>
          <Text style={styles.logSource}>[{log.source}] </Text>
          {log.content}
        </Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  contentContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyTitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  emptySubtext: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 14,
  },
  logLine: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontFamily: "Menlo",
    lineHeight: 18,
  },
  logSource: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    fontFamily: "Menlo",
  },
});
