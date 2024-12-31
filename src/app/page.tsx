"use client";
import "@copilotkit/react-ui/styles.css";

import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import SingleSpreadsheet from "./components/SingleSpreadsheet";
import {
  CopilotKit,
  useCopilotAction,
  useCopilotReadable,
} from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { INSTRUCTIONS } from "./instructions";
import { canonicalSpreadsheetData } from "./utils/canonicalSpreadsheetData";
import { SpreadsheetData } from "./types";
import { PreviewSpreadsheetChanges } from "./components/PreviewSpreadsheetChanges";
import { PropertyAddress, PropertyObject } from "./types";

const HomePage = () => {
  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      transcribeAudioUrl="/api/transcribe"
      textToSpeechUrl="/api/tts"
    >
      <CopilotSidebar
        instructions={INSTRUCTIONS}
        labels={{
          initial: "Welcome to the spreadsheet app! How can I help you?",
        }}
        defaultOpen={true}
        clickOutsideToClose={false}
      >
        <Main />
      </CopilotSidebar>
    </CopilotKit>
  );
};

const Main = () => {
  const [properties, setProperties] = useState<Partial<PropertyObject>[]>([]);
  const [newProperty, setNewProperty] = useState<Partial<PropertyObject>>({
    managementType: 'WEG',
    address: {}
  });

  // Behalte CopilotKit-Funktionalität
  useCopilotAction({
    name: "createProperty",
    description: "Create a new property object",
    parameters: [
      {
        name: "property",
        type: "object",
        description: "The property details",
        attributes: [
          {
            name: "title",
            type: "string",
            description: "Property title"
          },
          {
            name: "address",
            type: "object",
            description: "Property address",
            attributes: [
              {
                name: "street",
                type: "string",
                description: "Street name"
              },
              {
                name: "houseNumber",
                type: "string",
                description: "House number"
              },
              {
                name: "zipCode",
                type: "string",
                description: "ZIP code"
              },
              {
                name: "city",
                type: "string",
                description: "City"
              },
              {
                name: "country",
                type: "string",
                description: "Country"
              }
            ]
          }
        ]
      }
    ],
    handler: ({ property }) => {
      setProperties(prev => [...prev, property]);
    }
  });

  useCopilotAction({
    name: "fillPropertyForm",
    description: "Fill the property form fields with suggested values",
    parameters: [
      {
        name: "field",
        type: "string",
        description: "The field to fill (title, description, numberOfUnits, propertyId, zipCode, city, country, street, houseNumber, street2) or 'all' for complete form",
      },
      {
        name: "value",
        type: "string",
        description: "The value to fill in",
      }
    ],
    handler: ({ field, value }) => {
      setNewProperty(prev => {
        if (field === 'all') {
          // Parse the value as a complete property object
          try {
            const propertyData = JSON.parse(value);
            return {
              ...propertyData,
              address: propertyData.address || {}
            };
          } catch (e) {
            console.error('Invalid property data format');
            return prev;
          }
        }

        // Handle individual fields
        switch (field) {
          case 'title':
          case 'description':
          case 'propertyId':
          case 'managementType':
            return { ...prev, [field]: value };
          case 'numberOfUnits':
            return { ...prev, numberOfUnits: parseInt(value) };
          case 'zipCode':
          case 'city':
          case 'country':
          case 'street':
          case 'houseNumber':
          case 'street2':
            return {
              ...prev,
              address: {
                ...prev.address,
                [field]: value
              }
            };
          default:
            return prev;
        }
      });
    }
  });

  useCopilotAction({
    name: "suggestProperty",
    description: "Suggest a complete example property",
    parameters: [
      {
        name: "type",
        type: "string",
        description: "Type of property to suggest (residential, commercial, mixed)",
      }
    ],
    handler: ({ type }) => {
      let suggestion: Partial<PropertyObject> = {
        managementType: 'WEG',
        address: {}
      };

      switch (type) {
        case 'residential':
          suggestion = {
            title: "Wohnanlage Sonnenhof",
            managementType: "WEG",
            description: "Moderne Wohnanlage mit 24 Einheiten im Grünen",
            numberOfUnits: 24,
            propertyId: "WA-2024-001",
            address: {
              street: "Sonnenallee",
              houseNumber: "42",
              zipCode: "12345",
              city: "München",
              country: "Deutschland"
            }
          };
          break;
        case 'commercial':
          suggestion = {
            title: "Geschäftshaus Zentrum",
            managementType: "WEG",
            description: "Büro- und Geschäftshaus in zentraler Lage",
            numberOfUnits: 12,
            propertyId: "GH-2024-002",
            address: {
              street: "Hauptstraße",
              houseNumber: "1",
              zipCode: "80333",
              city: "München",
              country: "Deutschland"
            }
          };
          break;
        // Weitere Typen können hier hinzugefügt werden
      }

      setNewProperty(suggestion);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProperty.title || !newProperty.numberOfUnits || 
        !newProperty.address.zipCode || !newProperty.address.city ||
        !newProperty.address.country || !newProperty.address.street ||
        !newProperty.address.houseNumber) {
      alert('Bitte füllen Sie alle Pflichtfelder aus!');
      return;
    }
    setProperties(prev => [...prev, newProperty]);
    setNewProperty({ managementType: 'WEG', address: {} });
  };

  return (
    <div className="flex flex-col p-6 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <h2 className="text-2xl font-bold">Neues Objekt erstellen</h2>
        
        <div className="space-y-2">
          <label className="block">
            Titel*
            <input
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 text-gray-900"
              value={newProperty.title || ''}
              onChange={e => setNewProperty(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </label>

          <label className="block">
            Verwaltungstyp
            <select
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 text-gray-900 bg-white"
              value={newProperty.managementType}
              onChange={e => setNewProperty(prev => ({ ...prev, managementType: e.target.value }))}
            >
              <option value="WEG">WEG</option>
            </select>
          </label>

          <label className="block">
            Beschreibung (intern)
            <textarea
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 text-gray-900"
              value={newProperty.description || ''}
              onChange={e => setNewProperty(prev => ({ ...prev, description: e.target.value }))}
            />
          </label>

          <label className="block">
            Anzahl Einheiten (soll)*
            <input
              type="number"
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 text-gray-900"
              value={newProperty.numberOfUnits || ''}
              onChange={e => setNewProperty(prev => ({ ...prev, numberOfUnits: parseInt(e.target.value) }))}
              required
            />
          </label>

          <label className="block">
            Objektkennung
            <input
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 text-gray-900"
              value={newProperty.propertyId || ''}
              onChange={e => setNewProperty(prev => ({ ...prev, propertyId: e.target.value }))}
            />
          </label>

          <fieldset className="border p-4 rounded">
            <legend className="font-bold">Adresse</legend>
            
            <div className="space-y-2">
              <label className="block">
                PLZ*
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 text-gray-900"
                  value={newProperty.address?.zipCode || ''}
                  onChange={e => setNewProperty(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, zipCode: e.target.value }
                  }))}
                  required
                />
              </label>

              <label className="block">
                Ort*
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 text-gray-900"
                  value={newProperty.address?.city || ''}
                  onChange={e => setNewProperty(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, city: e.target.value }
                  }))}
                  required
                />
              </label>

              <label className="block">
                Land*
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 text-gray-900"
                  value={newProperty.address?.country || ''}
                  onChange={e => setNewProperty(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, country: e.target.value }
                  }))}
                  required
                />
              </label>

              <label className="block">
                Strasse 2
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 text-gray-900"
                  value={newProperty.address?.street2 || ''}
                  onChange={e => setNewProperty(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, street2: e.target.value }
                  }))}
                />
              </label>

              <label className="block">
                Strasse*
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 text-gray-900"
                  value={newProperty.address?.street || ''}
                  onChange={e => setNewProperty(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, street: e.target.value }
                  }))}
                  required
                />
              </label>

              <label className="block">
                Hausnummer*
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 text-gray-900"
                  value={newProperty.address?.houseNumber || ''}
                  onChange={e => setNewProperty(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, houseNumber: e.target.value }
                  }))}
                  required
                />
              </label>
            </div>
          </fieldset>
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Anlegen
        </button>
      </form>

      <div>
        <h2 className="text-2xl font-bold mb-4">Übersicht</h2>
        <div className="space-y-4">
          {properties.map((property, index) => (
            <div key={index} className="border p-4 rounded">
              <h3 className="font-bold">{property.title}</h3>
              <p>Verwaltungstyp: {property.managementType}</p>
              <p>Einheiten: {property.numberOfUnits}</p>
              <p>Adresse: {property.address?.street} {property.address?.houseNumber}, {property.address?.zipCode} {property.address?.city}, {property.address?.country}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
