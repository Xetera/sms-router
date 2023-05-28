//
//  sms_widgetApp.swift
//  sms-widget
//
//  Created by Xetera on 5/28/23.
//

import SwiftUI

@main
struct sms_widgetApp: App {
    let persistenceController = PersistenceController.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.managedObjectContext, persistenceController.container.viewContext)
        }
    }
}
