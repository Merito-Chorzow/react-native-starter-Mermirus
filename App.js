import React, { useState, useEffect, createContext, useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Location from "expo-location";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";

// 1. Prosty globalny stan (Context)
const NotesContext = createContext();

// ==========================================
// WIDOK 1: LISTA NOTATEK (HomeScreen)
// ==========================================
function HomeScreen({ navigation }) {
  const { notes, setNotes } = useContext(NotesContext);
  const [loading, setLoading] = useState(true);

  // Komunikacja z API (GET)
  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/posts?_limit=5")
      .then((response) => response.json())
      .then((data) => {
        const apiNotes = data.map((item) => ({
          id: item.id.toString(),
          title: item.title,
          description: item.body,
          location: "Brak lokalizacji (API)",
          date: new Date().toLocaleDateString(),
        }));
        setNotes(apiNotes);
        setLoading(false);
      })
      .catch(() => {
        Alert.alert("Błąd", "Brak połączenia z API");
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Brak notatek. Dodaj pierwszą!</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("Details", { note: item })}
            accessibilityLabel={`Zobacz szczegóły notatki: ${item.title}`}
          >
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.cardSub}>
              📍 {item.location} | 📅 {item.date}
            </Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddNote")}
        accessibilityLabel="Dodaj nową notatkę"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

// ==========================================
// WIDOK 2: SZCZEGÓŁY NOTATKI (DetailsScreen)
// ==========================================
function DetailsScreen({ route }) {
  const { note } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{note.title}</Text>
      <Text style={styles.info}>📅 Dodano: {note.date}</Text>
      <Text style={styles.info}>📍 Pozycja: {note.location}</Text>
      <View style={styles.divider} />
      <Text style={styles.body}>{note.description}</Text>
    </View>
  );
}

// ==========================================
// WIDOK 3: DODAWANIE NOTATKI (AddNoteScreen)
// ==========================================
function AddNoteScreen({ navigation }) {
  const { notes, setNotes } = useContext(NotesContext);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationStr, setLocationStr] = useState("Nie pobrano lokalizacji");
  const [isLocating, setIsLocating] = useState(false);

  // Funkcja natywna: GPS
  const getLocation = async () => {
    setIsLocating(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Błąd uprawnień", "Odmowa dostępu do lokalizacji GPS.");
      setIsLocating(false);
      return;
    }

    try {
      let location = await Location.getCurrentPositionAsync({});
      setLocationStr(
        `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`,
      );
    } catch (error) {
      Alert.alert("Błąd", "Nie udało się pobrać lokalizacji.");
    }
    setIsLocating(false);
  };

  // Komunikacja z API (POST - symulacja)
  const saveNote = () => {
    if (!title.trim()) {
      Alert.alert("Błąd walidacji", "Tytuł jest wymagany!");
      return;
    }

    const newNote = {
      id: Date.now().toString(),
      title,
      description,
      location: locationStr,
      date: new Date().toLocaleDateString(),
    };

    fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      body: JSON.stringify(newNote),
      headers: { "Content-type": "application/json; charset=UTF-8" },
    })
      .then((response) => response.json())
      .then(() => {
        setNotes([newNote, ...notes]);
        navigation.goBack();
      });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Tytuł notatki"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Opis wydarzenia..."
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.locText}>📍 {locationStr}</Text>

      <TouchableOpacity
        style={styles.btnSecondary}
        onPress={getLocation}
        disabled={isLocating}
      >
        {isLocating ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Pobierz GPS</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnPrimary} onPress={saveNote}>
        <Text style={styles.btnText}>Zapisz notatkę</Text>
      </TouchableOpacity>
    </View>
  );
}

// ==========================================
// GŁÓWNA STRUKTURA (Nawigacja i Context)
// ==========================================
const Stack = createNativeStackNavigator();

export default function App() {
  const [notes, setNotes] = useState([]);

  return (
    <NotesContext.Provider value={{ notes, setNotes }}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: "#0066cc" },
            headerTintColor: "#fff",
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: "Moje Notatki" }}
          />
          <Stack.Screen
            name="Details"
            component={DetailsScreen}
            options={{ title: "Szczegóły" }}
          />
          <Stack.Screen
            name="AddNote"
            component={AddNoteScreen}
            options={{ title: "Nowa Notatka" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </NotesContext.Provider>
  );
}

// ==========================================
// STYLe (Zapewniają dostępność - min 48px klikalne)
// ==========================================
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    minHeight: 60,
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  cardSub: { fontSize: 14, color: "#666", marginTop: 4 },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#888",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#0066cc",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  fabText: { color: "#fff", fontSize: 32, fontWeight: "bold", marginTop: -2 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 8, color: "#222" },
  info: { fontSize: 16, color: "#555", marginBottom: 4 },
  divider: { height: 1, backgroundColor: "#ccc", marginVertical: 12 },
  body: { fontSize: 16, color: "#333", lineHeight: 24 },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    minHeight: 48,
  },
  textArea: { height: 120, textAlignVertical: "top" },
  locText: {
    fontSize: 16,
    color: "#444",
    marginBottom: 12,
    fontStyle: "italic",
  },
  btnPrimary: {
    backgroundColor: "#0066cc",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    minHeight: 48,
    marginTop: 12,
  },
  btnSecondary: {
    backgroundColor: "#28a745",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    minHeight: 48,
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
