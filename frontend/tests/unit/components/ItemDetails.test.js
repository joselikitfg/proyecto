import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { BrowserRouter, MemoryRouter, Route, Routes } from "react-router-dom";
import ItemDetail from "../../../src/components/ItemDetail";


jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'), 
    useParams: () => ({
        id: '1'
    }),
    useNavigate: () => jest.fn().mockImplementation(() => ({}))
}));

describe("ItemDetail", () => {
    let mockAxios;

    beforeAll(() => {
        mockAxios = new MockAdapter(axios);
    });

    afterEach(() => {
        mockAxios.reset();
    });

    it("loads item details on mount", async () => {
        mockAxios.onGet("http://localhost:8082/items/1").reply(200, {
            name: "Test Item",
            price_per_unit: "10",
            total_price: "100",
            image_url: "http://example.com/image.jpg"
        });

        render(
            <MemoryRouter initialEntries={["/item/1"]}>
                <Routes>
                    <Route path="/item/:id" element={<ItemDetail />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText("Detalles del Ítem:")).toBeTruthy());
    });

    it("handles error during item fetch", async () => {
        mockAxios.onGet("http://localhost:8082/items/1").networkError();

        render(
            <MemoryRouter initialEntries={["/item/1"]}>
                <Routes>
                    <Route path="/item/:id" element={<ItemDetail />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.queryByText("Cargando...")).toBeTruthy());
    });
});
